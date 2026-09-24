// AWSBedrock.js
// Note generation via a user-configured AWS Bedrock proxy (Lambda Function URL / API Gateway) in eu-north-1.
//
// sessionStorage keys used:
//   bedrock_backend_url
//   bedrock_backend_secret
//   bedrock_model  (haiku-4-5 | sonnet-4 | sonnet-4-5 | sonnet-4-6 | opus-4-5 | opus-4-6 | opus-4-7)

import {
  beginNoteRun,
  bindGenerateNoteButton,
  finishNoteAbort,
  getSessionStorageValue,
  pushNormalizedNoteUsage,
  resolveCommonNoteInputs,
  startNoteTimer
} from "./core/note-runner.js";

// Only allow known model keys to be sent to the backend.
// (Prevents weird/stale values from sessionStorage from causing confusing backend errors.)
const ALLOWED_BEDROCK_MODEL_KEYS = new Set([
  "haiku-4-5",
  "sonnet-4",
  "sonnet-4-5",
  "sonnet-4-6",
  "opus-4-5",
  "opus-4-6",
  "opus-4-7",
]);

// On-Demand text pricing (USD) per 1M tokens.
// NOTE: Keep this in sync with your Bedrock/Anthropic pricing if AWS changes rates.
const BEDROCK_USD_PER_MTOK = {
  "haiku-4-5": { input: 1.0, output: 5.0 },
  "sonnet-4-5": { input: 3.0, output: 15.0 },
  "sonnet-4-6": { input: 3.0, output: 15.0 },
  "opus-4-5": { input: 5.0, output: 25.0 },
  "opus-4-6": { input: 5.0, output: 25.0 },
  "opus-4-7": { input: 5.0, output: 25.0 },
};

function formatUsd(amount) {
  if (!Number.isFinite(amount)) return "$0.00";
  const decimals = amount < 0.01 ? 6 : 4;
  return `$${amount.toFixed(decimals)}`;
}

function estimateOnDemandUsd({ modelKey, inputTokens, outputTokens }) {
  const rates = BEDROCK_USD_PER_MTOK[modelKey];
  if (!rates) return null;

  const inTok = Number(inputTokens);
  const outTok = Number(outputTokens);
  if (!Number.isFinite(inTok) || !Number.isFinite(outTok)) return null;

  const inputUsd = (inTok / 1_000_000) * rates.input;
  const outputUsd = (outTok / 1_000_000) * rates.output;

  return {
    rates,
    inputUsd,
    outputUsd,
    totalUsd: inputUsd + outputUsd,
  };
}

function getConfiguredModelKey() {
  const modelSelect = document.getElementById("bedrockModel");
  let modelKey =
    getSessionStorageValue("bedrock_model", "").trim() ||
    (modelSelect ? String(modelSelect.value || "").trim() : "");

  if (modelKey && !ALLOWED_BEDROCK_MODEL_KEYS.has(modelKey)) {
    modelKey = "";
  }

  return modelKey;
}

function getBedrockBackendConfig() {
  return {
    backendUrl: getSessionStorageValue("bedrock_backend_url", "").trim(),
    backendSecret: getSessionStorageValue("bedrock_backend_secret", "").trim()
  };
}

function buildBedrockCustomPrompt(promptText, supplementaryRaw) {
  const trimmedPrompt = typeof promptText === "string" ? promptText : "";
  const trimmedSupplementary = typeof supplementaryRaw === "string" ? supplementaryRaw.trim() : "";

  if (!trimmedSupplementary) {
    return trimmedPrompt;
  }

  const wrappedSupplementary = `Tilleggsopplysninger(brukes som kontekst):"${trimmedSupplementary}"`;
  return trimmedPrompt ? `${trimmedPrompt}\n\n${wrappedSupplementary}` : wrappedSupplementary;
}

function pushBedrockUsageToUi(modelId, usage) {
  if (!usage) {
    return;
  }

  pushNormalizedNoteUsage({
    providerKey: "aws-bedrock",
    modelId,
    usage: {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens
    }
  });
}

function logBedrockUsageAndCost(modelKey, usage) {
  if (!usage) {
    return;
  }

  const inputTokens = usage.inputTokens;
  const outputTokens = usage.outputTokens;

  console.log(`Input tokens: ${inputTokens}`);
  console.log(`Output tokens: ${outputTokens}`);

  const estimate = estimateOnDemandUsd({
    modelKey,
    inputTokens,
    outputTokens,
  });

  if (estimate) {
    console.log(
      `[Bedrock cost estimate] model=${modelKey} ` +
        `rates=$${estimate.rates.input}/MTok in, $${estimate.rates.output}/MTok out ` +
        `input=${formatUsd(estimate.inputUsd)} output=${formatUsd(estimate.outputUsd)} total=${formatUsd(estimate.totalUsd)}`
    );
  } else {
    console.log(
      `[Bedrock cost estimate] Skipped (unknown modelKey="${modelKey}" or missing token counts).`
    );
  }
}

async function generateNote() {
  const initialModelKey = getConfiguredModelKey() || "backend_default";
  const runMeta = {
    provider: "aws-bedrock",
    model: initialModelKey
  };

  const { app, controller } = beginNoteRun(runMeta);
  if (!controller) {
    return;
  }

  const common = resolveCommonNoteInputs(app);
  if (!common) {
    return;
  }

  const {
    transcriptionText,
    promptText,
    supplementaryRaw,
    generatedNoteField,
    noteTimerElement
  } = common;

  generatedNoteField.value = "";
  const noteTimer = startNoteTimer(noteTimerElement);

  const { backendUrl, backendSecret } = getBedrockBackendConfig();

  if (!backendUrl) {
    noteTimer.stop("");
    app.finishNoteGeneration?.();
    alert(
      "No Bedrock backend URL configured.\n\n" +
      "Please paste your Bedrock proxy URL on the start page before using AWS Bedrock."
    );
    return;
  }

  if (!backendSecret) {
    noteTimer.stop("");
    app.finishNoteGeneration?.();
    alert(
      "No Bedrock backend secret configured.\n\n" +
      "Please paste your backend secret (X-Proxy-Secret) on the start page before using AWS Bedrock."
    );
    return;
  }

  const modelKey = getConfiguredModelKey();
  const customPrompt = buildBedrockCustomPrompt(promptText, supplementaryRaw);

  let resolvedModelKey = modelKey || "backend_default";

  try {
    const resp = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Proxy-Secret": backendSecret,
      },
      body: JSON.stringify({
        transcription: transcriptionText,
        customPrompt,
        modelKey: modelKey || undefined,
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error("Bedrock backend HTTP " + resp.status + (text ? ": " + text : ""));
    }

    const data = await resp.json().catch(() => ({}));
    const noteText =
      (data && (data.noteText || data.text || data.output || data.note)) ||
      "[No text returned from Bedrock backend]";

    const effectiveModelKey =
      (data && (data.modelKey || data.model)) ||
      modelKey ||
      "backend_default";
    resolvedModelKey = effectiveModelKey;

    const usage = data && data.usage;
    pushBedrockUsageToUi(effectiveModelKey, usage);
    logBedrockUsageAndCost(effectiveModelKey, usage);

    generatedNoteField.value = noteText;
    noteTimer.stop("Text generation completed!");
    app.emitNoteFinished?.({
      provider: "aws-bedrock",
      model: resolvedModelKey
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      finishNoteAbort({
        generatedNoteField,
        noteTimer,
        runMeta: {
          provider: "aws-bedrock",
          model: resolvedModelKey
        }
      });
      return;
    }

    console.error("Bedrock note error:", err);
    noteTimer.stop("");
    generatedNoteField.value = "Error generating note via AWS Bedrock: " + String(err);
    app.finishNoteGeneration?.();
  }
}

function initNoteGeneration() {
  bindGenerateNoteButton(generateNote);
}

export { initNoteGeneration };
