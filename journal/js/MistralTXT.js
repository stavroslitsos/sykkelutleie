// MistralTXT.js

import {
  beginNoteRun,
  bindGenerateNoteButton,
  buildStandardNotePrompt,
  finishNoteAbort,
  pushNormalizedNoteUsage,
  requireSessionKey,
  resolveCommonNoteInputs,
  startNoteTimer,
  streamChatCompletionsSse
} from "./core/note-runner.js";

const RUN_META = {
  provider: "mistral",
  model: "mistral-large-latest"
};

function logMistralUsage(usage) {
  if (!usage) {
    return;
  }

  console.log(
    "[Mistral token usage]",
    "input=",
    usage.prompt_tokens,
    "output=",
    usage.completion_tokens,
    "total=",
    usage.total_tokens
  );

  pushNormalizedNoteUsage({
    providerKey: RUN_META.provider,
    modelId: RUN_META.model,
    usage
  });
}

async function generateNote() {
  const { app, controller } = beginNoteRun(RUN_META);
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
    supplementaryWrapped,
    generatedNoteField,
    noteTimerElement
  } = common;

  generatedNoteField.value = "";
  const noteTimer = startNoteTimer(noteTimerElement);

  const apiKey = requireSessionKey("mistral_api_key", {
    onMissing: () => {
      noteTimer.stop("");
      app.finishNoteGeneration?.();
    }
  });

  if (!apiKey) {
    return;
  }

  const finalPromptText = buildStandardNotePrompt(promptText);

  try {
    const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: RUN_META.model,
        messages: [
          { role: "system", content: finalPromptText },
          { role: "user", content: `${supplementaryWrapped}${transcriptionText}` }
        ],
        stream: true
      }),
      signal: controller.signal
    });

    await streamChatCompletionsSse(resp, {
      signal: controller.signal,
      errorLabel: "Mistral",
      captureUsage: true,
      onDelta: (textChunk) => {
        generatedNoteField.value += textChunk;
      },
      onDone: (finalEvent) => {
        logMistralUsage(finalEvent?.usage);
      },
      onError: (error) => {
        throw error;
      }
    });

    noteTimer.stop("Text generation completed!");
    app.emitNoteFinished?.(RUN_META);
  } catch (error) {
    if (error?.name === "AbortError") {
      finishNoteAbort({
        generatedNoteField,
        noteTimer,
        runMeta: RUN_META
      });
      return;
    }

    noteTimer.stop("");

    if (generatedNoteField) {
      generatedNoteField.value = "Error generating note: " + error;
    }

    app.finishNoteGeneration?.();
  }
}

function initNoteGeneration() {
  bindGenerateNoteButton(generateNote);
}

export { initNoteGeneration };
