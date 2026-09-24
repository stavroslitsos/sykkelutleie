// Direct OpenAI note generation through the Responses API.
// Model, reasoning effort, and streaming mode are resolved from the live UI.

import {
  beginNoteRun,
  bindGenerateNoteButton,
  buildStandardNotePrompt,
  extractResponsesOutputText,
  finishNoteAbort,
  getSelectValue,
  pushNormalizedNoteUsage,
  requireSessionKey,
  resolveCommonNoteInputs,
  startNoteTimer,
  streamResponsesSse
} from "./core/note-runner.js";
import {
  DEFAULTS,
  getDefaultOpenAiReasoning,
  normalizeOpenAiModel,
  normalizeOpenAiReasoning
} from "./core/provider-registry.js";

function buildRequestBody({
  model,
  finalPromptText,
  supplementaryWrapped,
  transcriptionText,
  streaming,
  reasoningLevel
}) {
  const requestBody = {
    model,
    store: false,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: finalPromptText }]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: `${supplementaryWrapped}${transcriptionText}` }]
      }
    ],
    text: { verbosity: "medium" }
  };

  if (streaming) requestBody.stream = true;

  // GPT-5.6 defaults to Medium when omitted, so `none` must be sent
  // explicitly when the user chooses it.
  if (reasoningLevel) {
    requestBody.reasoning = { effort: reasoningLevel };
  }

  return requestBody;
}

function resolveReasoningLevel(model) {
  const raw = getSelectValue("gpt5Reasoning", getDefaultOpenAiReasoning(model));
  return normalizeOpenAiReasoning(raw, model);
}

function pushUsage({ model, usage }) {
  if (!usage) return;
  pushNormalizedNoteUsage({
    providerKey: "openai",
    modelId: model,
    usage,
    meta: {
      reasoningTokens: usage?.output_tokens_details?.reasoning_tokens ?? 0
    }
  });
}

async function generateNote() {
  const mode = getSelectValue("noteProviderMode", DEFAULTS.noteMode).toLowerCase();
  const streaming = mode !== "non-streaming";
  const model = normalizeOpenAiModel(
    getSelectValue("openaiModel", DEFAULTS.openaiModel)
  );
  const runMeta = { provider: "openai", model, mode };

  const { app, controller } = beginNoteRun(runMeta);
  if (!controller) return;

  const common = resolveCommonNoteInputs(app);
  if (!common) return;

  const {
    transcriptionText,
    promptText,
    supplementaryWrapped,
    generatedNoteField,
    noteTimerElement
  } = common;

  generatedNoteField.value = "";
  const noteTimer = startNoteTimer(noteTimerElement);
  const apiKey = requireSessionKey("openai_api_key", {
    onMissing: () => {
      noteTimer.stop("");
      app.finishNoteGeneration?.();
    }
  });
  if (!apiKey) return;

  const requestBody = buildRequestBody({
    model,
    finalPromptText: buildStandardNotePrompt(promptText),
    supplementaryWrapped,
    transcriptionText,
    streaming,
    reasoningLevel: resolveReasoningLevel(model)
  });

  try {
    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    if (!streaming) {
      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        throw new Error(`OpenAI error ${resp.status}: ${errText}`);
      }

      const json = await resp.json();
      pushUsage({ model, usage: json?.usage ?? null });
      generatedNoteField.value = extractResponsesOutputText(json) || "";
    } else {
      await streamResponsesSse(resp, {
        signal: controller.signal,
        errorLabel: "OpenAI",
        onDelta: (textChunk) => {
          generatedNoteField.value += textChunk;
        },
        onDone: (finalEvent) => {
          pushUsage({
            model,
            usage: finalEvent?.response?.usage ?? finalEvent?.usage ?? null
          });
        },
        onError: (error) => {
          throw error;
        }
      });
    }

    noteTimer.stop("Text generation completed!");
    app.emitNoteFinished?.(runMeta);
  } catch (error) {
    if (error?.name === "AbortError") {
      finishNoteAbort({ generatedNoteField, noteTimer, runMeta });
      return;
    }

    noteTimer.stop("");
    generatedNoteField.value = "Error generating note: " + error;
    app.finishNoteGeneration?.();
  }
}

function initOpenAiNoteGeneration() {
  bindGenerateNoteButton(generateNote);
}

export { initOpenAiNoteGeneration };
