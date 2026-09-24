// js/core/provider-registry.js
//
// Canonical provider metadata + path resolution for both recording (STT)
// and note-generation providers.
//
// Purpose:
// - keep module-path decisions in one place
// - keep effective-provider <-> UI-provider mapping in one place
// - keep default values together so controller/UI modules stop drifting

export const DEFAULTS = {
  transcribeProvider: 'soniox',
  sonioxRegion: 'eu',
  sonioxSpeakerLabels: 'off',
  noteProvider: 'aws-bedrock',
  openaiModel: 'gpt-5.6-sol',
  openaiEffectiveProvider: 'openai-gpt56-sol',
  openaiReasoning: 'medium',
  noteMode: 'streaming',
  bedrockModel: 'opus-4-5',
  requestyModel: 'claude-opus-5-5',
  requestyNanoReasoning: 'medium',
};

const TRANSCRIBE_PROVIDER_REGISTRY = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    shortLabel: 'OpenAI',
    modulePath: './recording.js',
    activeApiKeyStorageKey: 'openai_api_key',
  },
  soniox: {
    id: 'soniox',
    label: 'Soniox',
    shortLabel: 'Soniox',
    // Both async-plain and async-diarized live in the merged module; it
    // detects the speaker-labels setting at initRecording() time.
    modulePath: './soniox.js',
    activeApiKeyStorageKey: 'soniox_api_key',
  },
  soniox_rt: {
    id: 'soniox_rt',
    // Tagline displayed in dropdowns. The "(real-time)" suffix is intentional:
    // it's how the user can distinguish this entry from the plain "Soniox"
    // (async/batch) entry — same family, different transport.
    label: 'Soniox (real-time)',
    shortLabel: 'Soniox RT',
    // Same merged module — the realtime branch is selected when the
    // transcribe_provider session key is 'soniox_rt'.
    modulePath: './soniox.js',
    // Reuse the same API key as plain Soniox so the user only enters it once.
    activeApiKeyStorageKey: 'soniox_api_key',
  },
  voxtral: {
    id: 'voxtral',
    label: 'Mistral (Voxtral Mini Transcribe)',
    shortLabel: 'Mistral',
    modulePath: './VoxtralminiSTT.js',
    activeApiKeyStorageKey: 'mistral_api_key',
  },
};

const NOTE_PROVIDER_REGISTRY = {
  'openai-gpt56-sol': {
    id: 'openai-gpt56-sol',
    label: 'GPT-5.6 Sol',
    uiProvider: 'openai',
    openaiModel: 'gpt-5.6-sol',
    mode: DEFAULTS.noteMode,
    modulePath: './noteGeneration_openai.js',
    initExportName: 'initOpenAiNoteGeneration',
  },
  'openai-gpt56-terra': {
    id: 'openai-gpt56-terra',
    label: 'GPT-5.6 Terra',
    uiProvider: 'openai',
    openaiModel: 'gpt-5.6-terra',
    mode: DEFAULTS.noteMode,
    modulePath: './noteGeneration_openai.js',
    initExportName: 'initOpenAiNoteGeneration',
  },
  'openai-gpt56-luna': {
    id: 'openai-gpt56-luna',
    label: 'GPT-5.6 Luna',
    uiProvider: 'openai',
    openaiModel: 'gpt-5.6-luna',
    mode: DEFAULTS.noteMode,
    modulePath: './noteGeneration_openai.js',
    initExportName: 'initOpenAiNoteGeneration',
  },
  'openai-gpt5-nano': {
    id: 'openai-gpt5-nano',
    label: 'GPT-5 Nano',
    uiProvider: 'openai',
    openaiModel: 'gpt-5-nano',
    mode: DEFAULTS.noteMode,
    modulePath: './noteGeneration_openai.js',
    initExportName: 'initOpenAiNoteGeneration',
  },
  mistral: {
    id: 'mistral',
    label: 'Mistral',
    uiProvider: 'mistral',
    modulePath: './MistralTXT.js',
  },
  'aws-bedrock': {
    id: 'aws-bedrock',
    label: 'AWS Bedrock',
    uiProvider: 'aws-bedrock',
    modulePath: './AWSBedrock.js',
  },
  // Requesty (GDPR-compliant router; EU endpoint + EU-region models).
  // Requesty variants are mode-driven: the module reads
  // #noteProviderMode at run time, so one effective provider per model.
  'requesty-claude': {
    id: 'requesty-claude',
    label: 'Requesty Claude Opus 5.5',
    uiProvider: 'requesty',
    requestyModel: 'claude-opus-5-5',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyClaudeOpus55',
  },
  'requesty-sonnet': {
    id: 'requesty-sonnet',
    label: 'Requesty Claude Sonnet 5',
    uiProvider: 'requesty',
    requestyModel: 'claude-sonnet-5',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyClaudeSonnet5',
  },
  'requesty-gpt6-luna': {
    id: 'requesty-gpt6-luna',
    label: 'Requesty GPT-6 Luna',
    uiProvider: 'requesty',
    requestyModel: 'gpt-6-luna',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyGpt6Luna',
  },
  'requesty-gpt6-sol': {
    id: 'requesty-gpt6-sol',
    label: 'Requesty GPT-6 Sol',
    uiProvider: 'requesty',
    requestyModel: 'gpt-6-sol',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyGpt6Sol',
  },
  'requesty-gpt55': {
    id: 'requesty-gpt55',
    label: 'Requesty GPT-5.5',
    uiProvider: 'requesty',
    requestyModel: 'gpt-5.5',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyGpt55',
  },
  'requesty-nano': {
    id: 'requesty-nano',
    label: 'Requesty GPT-5 Nano',
    uiProvider: 'requesty',
    requestyModel: 'gpt-5-nano',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyGpt5Nano',
  },
  'requesty-gpt56-luna': {
    id: 'requesty-gpt56-luna',
    label: 'Requesty GPT-5.6 Luna',
    uiProvider: 'requesty',
    requestyModel: 'gpt-5.6-luna',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyGpt56Luna',
  },
  'requesty-gpt56-terra': {
    id: 'requesty-gpt56-terra',
    label: 'Requesty GPT-5.6 Terra',
    uiProvider: 'requesty',
    requestyModel: 'gpt-5.6-terra',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyGpt56Terra',
  },
  'requesty-gpt56-sol': {
    id: 'requesty-gpt56-sol',
    label: 'Requesty GPT-5.6 Sol',
    uiProvider: 'requesty',
    requestyModel: 'gpt-5.6-sol',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyGpt56Sol',
  },
  'requesty-gemini38-flash': {
    id: 'requesty-gemini38-flash',
    label: 'Requesty Gemini 3.8 Flash',
    uiProvider: 'requesty',
    requestyModel: 'gemini-3.8-flash',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyGemini38Flash',
  },
  'requesty-deepseek-v4-pro': {
    id: 'requesty-deepseek-v4-pro',
    label: 'Requesty DeepSeek V4 Pro',
    uiProvider: 'requesty',
    requestyModel: 'deepseek-v4-pro-0813',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyDeepSeekV4Pro',
  },
  'requesty-deepseek-v41-flash': {
    id: 'requesty-deepseek-v41-flash',
    label: 'Requesty DeepSeek V4.1 Flash',
    uiProvider: 'requesty',
    requestyModel: 'deepseek-v4.1-flash',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyDeepSeekV41Flash',
  },
  'requesty-kimi-k3': {
    id: 'requesty-kimi-k3',
    label: 'Requesty Kimi K3',
    uiProvider: 'requesty',
    requestyModel: 'kimi-k3',
    mode: DEFAULTS.noteMode,
    modulePath: './requesty.js',
    initExportName: 'initRequestyKimiK3',
  },
};

const NOTE_UI_PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'aws-bedrock', label: 'AWS Bedrock' },
  { value: 'requesty', label: 'Requesty' },
];

const REQUESTY_MODEL_OPTIONS = [
  { value: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
  { value: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
  { value: 'gpt-6-sol', label: 'GPT-6 Sol' },
  { value: 'gpt-6-luna', label: 'GPT-6 Luna' },
  { value: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' },
  { value: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' },
  { value: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
  { value: 'gpt-5.5', label: 'GPT-5.5' },
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  { value: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
  { value: 'deepseek-v4-pro-0813', label: 'DeepSeek V4 Pro' },
  { value: 'deepseek-v4.1-flash', label: 'DeepSeek V4.1 Flash' },
  { value: 'kimi-k3', label: 'Kimi K3' },
];

// Models with model-specific Requesty reasoning controls use the existing
// dedicated selector. GPT-5 Nano accepts minimal | low | medium | high.
// Requesty's Chat Completions gateway preserves four distinct GPT-5.6 effort
// levels: low | medium | high | xhigh. Requesty currently normalizes `none`
// to `low` and `max` to `high`, so those aliases are intentionally omitted.
// Kimi K3 always reasons and accepts low | high | max. The upstream model
// defaults to max when omitted, but the app intentionally defaults to low.
const REQUESTY_NANO_REASONING_OPTIONS = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// Claude Opus 5.5 always uses adaptive reasoning. The upstream model
// supports additional effort levels, but the app intentionally exposes only
// low | medium | high and defaults to low.
const REQUESTY_OPUS55_REASONING_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// GPT-6 Luna/Sol support a wider upstream reasoning range, but the Requesty
// UI intentionally exposes only the four levels requested by the app:
// none | low | medium | high. Low is the app default for these two models.
const REQUESTY_GPT6_REASONING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const REQUESTY_GPT56_REASONING_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'xhigh', label: 'X-high' },
];

// Gemini 3.8 Flash supports exactly low | medium | high. The upstream model
// defaults to medium, but the app intentionally defaults it to low.
const REQUESTY_GEMINI38_REASONING_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const REQUESTY_KIMI_K3_REASONING_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'high', label: 'High' },
  { value: 'max', label: 'Max' },
];

// DeepSeek V4 Pro and V4.1 Flash support thinking off plus three distinct
// effort levels. DeepSeek maps medium/xhigh to high, so those aliases are not
// shown. DeepSeek defaults to high upstream, but the app intentionally uses
// low to reduce latency and reasoning-token cost for routine note generation.
const REQUESTY_DEEPSEEK_REASONING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'high', label: 'High' },
  { value: 'max', label: 'Max' },
];

const REQUESTY_DEEPSEEK_MODELS = new Set([
  'deepseek-v4-pro-0813',
  'deepseek-v4.1-flash',
]);

const REQUESTY_GPT6_MODELS = new Set([
  'gpt-6-luna',
  'gpt-6-sol',
]);

const REQUESTY_GPT56_MODELS = new Set([
  'gpt-5.6-luna',
  'gpt-5.6-terra',
  'gpt-5.6-sol',
]);

const OPENAI_NOTE_MODEL_OPTIONS = [
  { value: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' },
  { value: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' },
  { value: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
];

const NOTE_MODE_OPTIONS = [
  { value: 'streaming', label: 'streaming' },
  { value: 'non-streaming', label: 'non-streaming' },
];

const OPENAI_GPT56_REASONING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'xhigh', label: 'X-high' },
  { value: 'max', label: 'Max' },
];

const OPENAI_GPT5_NANO_REASONING_OPTIONS = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const SHARED_REQUESTY_REASONING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const OPENAI_GPT56_MODELS = new Set([
  'gpt-5.6-sol',
  'gpt-5.6-terra',
  'gpt-5.6-luna',
]);

const BEDROCK_MODEL_OPTIONS = [
  { value: 'haiku-4-5', label: 'Claude Haiku 4.5' },
  { value: 'sonnet-4-5', label: 'Claude Sonnet 4.5' },
  { value: 'sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'opus-4-5', label: 'Claude Opus 4.5' },
  { value: 'opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'opus-4-7', label: 'Claude Opus 4.7' },
];

const SONIOX_REGION_OPTIONS = [
  { value: 'us', label: 'US' },
  { value: 'eu', label: 'EU (GDPR Compliant)' },
];

const SONIOX_SPEAKER_LABEL_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: 'on', label: 'On' },
];

export function listTranscribeProviders() {
  return Object.keys(TRANSCRIBE_PROVIDER_REGISTRY);
}

export function listNoteEffectiveProviders() {
  return Object.keys(NOTE_PROVIDER_REGISTRY);
}

export function listTranscribeProviderOptions() {
  return listTranscribeProviders().map((providerId) => ({
    value: providerId,
    label: getTranscribeProviderLabel(providerId),
  }));
}

export function listNoteUiProviderOptions() {
  return NOTE_UI_PROVIDER_OPTIONS.map((item) => ({ ...item }));
}

export function listOpenAiModelOptions() {
  return OPENAI_NOTE_MODEL_OPTIONS.map((item) => ({ ...item }));
}

export function normalizeOpenAiModel(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (OPENAI_NOTE_MODEL_OPTIONS.some((item) => item.value === raw)) return raw;

  // Backward compatibility: retired direct OpenAI selections migrate to Sol.
  if (
    raw === 'gpt4' || raw === 'gpt5' || raw === 'gpt52' ||
    raw === 'gpt54' || raw === 'gpt55' || raw === 'gpt-5.1' ||
    raw === 'gpt-5.2' || raw === 'gpt-5.4' || raw === 'gpt-5.5'
  ) {
    return DEFAULTS.openaiModel;
  }

  return DEFAULTS.openaiModel;
}

export function listNoteModeOptions() {
  return NOTE_MODE_OPTIONS.map((item) => ({ ...item }));
}

export function listOpenAiReasoningOptions(modelId = DEFAULTS.openaiModel) {
  const model = normalizeOpenAiModel(modelId);
  const options = OPENAI_GPT56_MODELS.has(model)
    ? OPENAI_GPT56_REASONING_OPTIONS
    : OPENAI_GPT5_NANO_REASONING_OPTIONS;
  return options.map((item) => ({ ...item }));
}

export function getDefaultOpenAiReasoning() {
  return DEFAULTS.openaiReasoning;
}

export function listSharedRequestyReasoningOptions() {
  return SHARED_REQUESTY_REASONING_OPTIONS.map((item) => ({ ...item }));
}

export function normalizeSharedRequestyReasoning(value) {
  const raw = String(value || '').trim().toLowerCase();
  return SHARED_REQUESTY_REASONING_OPTIONS.some((item) => item.value === raw)
    ? raw
    : 'low';
}

export function listBedrockModelOptions() {
  return BEDROCK_MODEL_OPTIONS.map((item) => ({ ...item }));
}

export function listRequestyModelOptions() {
  return REQUESTY_MODEL_OPTIONS.map((item) => ({ ...item }));
}

export function normalizeRequestyModel(value) {
  const raw = String(value || '').trim().toLowerCase();
  // Backward compatibility: migrate retired model selections.
  if (raw === 'claude-opus-5') return 'claude-opus-5-5';
  if (raw === 'gemini-3.7-flash') return 'gemini-3.8-flash';
  return REQUESTY_MODEL_OPTIONS.some((item) => item.value === raw)
    ? raw
    : DEFAULTS.requestyModel;
}

export function listRequestyNanoReasoningOptions(
  modelId = 'gpt-5-nano'
) {
  const normalizedModel = normalizeRequestyModel(modelId);
  const options =
    normalizedModel === 'claude-opus-5-5'
      ? REQUESTY_OPUS55_REASONING_OPTIONS
      : REQUESTY_DEEPSEEK_MODELS.has(normalizedModel)
        ? REQUESTY_DEEPSEEK_REASONING_OPTIONS
        : normalizedModel === 'kimi-k3'
          ? REQUESTY_KIMI_K3_REASONING_OPTIONS
          : normalizedModel === 'gemini-3.8-flash'
            ? REQUESTY_GEMINI38_REASONING_OPTIONS
            : REQUESTY_GPT6_MODELS.has(normalizedModel)
              ? REQUESTY_GPT6_REASONING_OPTIONS
              : REQUESTY_GPT56_MODELS.has(normalizedModel)
                ? REQUESTY_GPT56_REASONING_OPTIONS
                : REQUESTY_NANO_REASONING_OPTIONS;
  return options.map((item) => ({ ...item }));
}

export function getDefaultRequestyReasoning(modelId = 'gpt-5-nano') {
  const normalizedModel = normalizeRequestyModel(modelId);
  if (
    normalizedModel === 'claude-opus-5-5' ||
    REQUESTY_DEEPSEEK_MODELS.has(normalizedModel)
  ) return 'low';
  return REQUESTY_GPT6_MODELS.has(normalizedModel) ||
    normalizedModel === 'gemini-3.8-flash' ||
    normalizedModel === 'kimi-k3'
    ? 'low'
    : DEFAULTS.requestyNanoReasoning;
}

export function normalizeRequestyNanoReasoning(
  value,
  modelId = 'gpt-5-nano'
) {
  const raw = String(value || '').trim().toLowerCase();
  const normalizedModel = normalizeRequestyModel(modelId);
  const options = listRequestyNanoReasoningOptions(modelId);
  return options.some((item) => item.value === raw)
    ? raw
    : getDefaultRequestyReasoning(normalizedModel);
}

// Maps a Requesty UI model value to its effective note provider by scanning
// the registry (derived, not hard-coded), so adding a new Requesty model only
// requires a registry entry + option — routing follows automatically.
export function resolveRequestyEffectiveProvider(requestyModel) {
  const normalizedModel = normalizeRequestyModel(requestyModel);
  const match = Object.values(NOTE_PROVIDER_REGISTRY).find(
    (config) => config.uiProvider === 'requesty' && config.requestyModel === normalizedModel
  );
  return match ? match.id : 'requesty-claude';
}

export function listSonioxRegionOptions() {
  return SONIOX_REGION_OPTIONS.map((item) => ({ ...item }));
}

export function listSonioxSpeakerLabelOptions() {
  return SONIOX_SPEAKER_LABEL_OPTIONS.map((item) => ({ ...item }));
}

export function normalizeTranscribeProvider(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'soniox_dia') return 'soniox';
  return TRANSCRIBE_PROVIDER_REGISTRY[raw] ? raw : DEFAULTS.transcribeProvider;
}

export function getTranscribeProviderConfig(provider, options = {}) {
  const normalized = normalizeTranscribeProvider(provider);
  const config = TRANSCRIBE_PROVIDER_REGISTRY[normalized] || TRANSCRIBE_PROVIDER_REGISTRY[DEFAULTS.transcribeProvider];

  // The plain "soniox" provider serves both the async-plain and
  // async-diarized modes from the same module file. We still surface the
  // resolved speakerLabels in the returned config so callers (e.g. the
  // mini panel label "Soniox" vs "Soniox (dia)") can distinguish them
  // without doing their own session lookup.
  if (normalized === 'soniox') {
    const speakerLabels = String(options.sonioxSpeakerLabels || DEFAULTS.sonioxSpeakerLabels).toLowerCase();
    return {
      ...config,
      sonioxSpeakerLabels: speakerLabels,
    };
  }

  return { ...config };
}

export function resolveTranscribeModulePath(provider, options = {}) {
  return getTranscribeProviderConfig(provider, options).modulePath;
}

export function getTranscribeActiveApiKeyStorageKey(provider) {
  return getTranscribeProviderConfig(provider).activeApiKeyStorageKey;
}

export function getTranscribeProviderLabel(provider) {
  const config = getTranscribeProviderConfig(provider);
  return String(config.label || config.id || '').trim();
}

export function getTranscribeProviderShortLabel(provider) {
  const config = getTranscribeProviderConfig(provider);
  return String(config.shortLabel || config.label || config.id || '').trim();
}

export function normalizeNoteEffectiveProvider(value) {
  const raw = String(value || '').trim().toLowerCase();
  // Migrate effective-provider ids saved before Gemini 3.8 replaced 3.7.
  if (raw === 'requesty-gemini37-flash') return 'requesty-gemini38-flash';
  // Retired direct OpenAI providers remain OpenAI and migrate to GPT-5.6 Sol.
  if (
    raw === 'openai' || raw === 'gpt4' || raw === 'gpt5' ||
    raw === 'gpt5-ns' || raw === 'gpt52' || raw === 'gpt52-ns' ||
    raw === 'gpt54' || raw === 'gpt55' || raw === 'gpt55-ns'
  ) {
    return DEFAULTS.openaiEffectiveProvider;
  }

  const directModel = OPENAI_NOTE_MODEL_OPTIONS.find((item) => item.value === raw);
  if (directModel) {
    const match = Object.values(NOTE_PROVIDER_REGISTRY).find(
      (config) => config.uiProvider === 'openai' && config.openaiModel === directModel.value
    );
    if (match) return match.id;
  }
  return NOTE_PROVIDER_REGISTRY[raw] ? raw : DEFAULTS.noteProvider;
}

export function normalizeNoteUiProvider(value) {
  const raw = String(value || '').trim().toLowerCase();
  return NOTE_UI_PROVIDER_OPTIONS.some((item) => item.value === raw)
    ? raw
    : inferNoteProviderUi(DEFAULTS.noteProvider);
}

export function resolveEffectiveNoteProvider({ provider, openaiModel, noteMode, requestyModel } = {}) {
  const uiProvider = String(provider || DEFAULTS.noteProvider).trim().toLowerCase();

  if (uiProvider === 'requesty') {
    return resolveRequestyEffectiveProvider(requestyModel);
  }

  if (uiProvider !== 'openai') {
    return normalizeNoteEffectiveProvider(uiProvider);
  }

  const model = normalizeOpenAiModel(openaiModel);
  const match = Object.values(NOTE_PROVIDER_REGISTRY).find(
    (config) => config.uiProvider === 'openai' && config.openaiModel === model
  );
  return match ? match.id : DEFAULTS.openaiEffectiveProvider;
}

export function deriveNoteUiStateFromEffectiveProvider(effectiveProvider, storedMode = DEFAULTS.noteMode) {
  const normalized = normalizeNoteEffectiveProvider(effectiveProvider);
  const config = NOTE_PROVIDER_REGISTRY[normalized] || NOTE_PROVIDER_REGISTRY[DEFAULTS.noteProvider];

  if (config.uiProvider === 'requesty') {
    // Requesty variants are mode-driven: respect the stored
    // note mode instead of forcing the default.
    return {
      provider: 'requesty',
      openaiModel: DEFAULTS.openaiModel,
      requestyModel: config.requestyModel || DEFAULTS.requestyModel,
      mode: normalizeNoteMode(storedMode),
      effectiveProvider: normalized,
    };
  }

  if (config.uiProvider !== 'openai') {
    return {
      provider: config.uiProvider,
      openaiModel: DEFAULTS.openaiModel,
      requestyModel: DEFAULTS.requestyModel,
      mode: DEFAULTS.noteMode,
      effectiveProvider: normalized,
    };
  }

  return {
    provider: 'openai',
    openaiModel: config.openaiModel || DEFAULTS.openaiModel,
    requestyModel: DEFAULTS.requestyModel,
    mode: normalizeNoteMode(storedMode),
    effectiveProvider: normalized,
  };
}

export function inferNoteProviderUi(effectiveProvider) {
  return deriveNoteUiStateFromEffectiveProvider(effectiveProvider).provider;
}

export function normalizeNoteMode(mode) {
  return String(mode || '').trim().toLowerCase() === 'non-streaming'
    ? 'non-streaming'
    : DEFAULTS.noteMode;
}

export function normalizeOpenAiReasoning(value, modelId = DEFAULTS.openaiModel) {
  const raw = String(value || '').trim().toLowerCase();
  return listOpenAiReasoningOptions(modelId).some((item) => item.value === raw)
    ? raw
    : getDefaultOpenAiReasoning();
}

export function getNoteProviderConfig(effectiveProvider) {
  const normalized = normalizeNoteEffectiveProvider(effectiveProvider);
  return {
    ...(NOTE_PROVIDER_REGISTRY[normalized] || NOTE_PROVIDER_REGISTRY[DEFAULTS.noteProvider]),
    id: normalized,
  };
}

export function resolveNoteModulePath(effectiveProvider) {
  return getNoteProviderConfig(effectiveProvider).modulePath;
}

// Returns the name of the named export to call on the loaded module
// (e.g. 'initOpenAiNoteGeneration'). Falls back to 'initNoteGeneration' for
// providers that don't specify an explicit export, so non-OpenAI
// modules (Mistral and AWS Bedrock) keep their existing
// loader behaviour.
export function resolveNoteInitExportName(effectiveProvider) {
  const config = getNoteProviderConfig(effectiveProvider);
  return String(config.initExportName || 'initNoteGeneration');
}

export function getNoteProviderLogLabel({
  effectiveProvider,
  openaiModel,
  bedrockModel,
} = {}) {
  const normalized = normalizeNoteEffectiveProvider(effectiveProvider);
  if (isRequestyEffectiveNoteProvider(normalized)) {
    const config = getNoteProviderConfig(normalized);
    return `requesty:${config.requestyModel || DEFAULTS.requestyModel}`;
  }
  if (normalized === 'aws-bedrock' && bedrockModel) return String(bedrockModel).toLowerCase();
  const config = getNoteProviderConfig(normalized);
  if (config.uiProvider === 'openai') {
    const derived = deriveNoteUiStateFromEffectiveProvider(normalized);
    return String(openaiModel || derived.openaiModel || DEFAULTS.openaiModel).toLowerCase();
  }

  return normalized;
}

export function isOpenAiEffectiveNoteProvider(effectiveProvider) {
  return getNoteProviderConfig(effectiveProvider).uiProvider === 'openai';
}

export function isMistralEffectiveNoteProvider(effectiveProvider) {
  return normalizeNoteEffectiveProvider(effectiveProvider) === 'mistral';
}

export function isBedrockEffectiveNoteProvider(effectiveProvider) {
  return normalizeNoteEffectiveProvider(effectiveProvider) === 'aws-bedrock';
}

export function isRequestyEffectiveNoteProvider(effectiveProvider) {
  return getNoteProviderConfig(effectiveProvider).uiProvider === 'requesty';
}

export function getDefaultModelIdForEffectiveNoteProvider({
  effectiveProvider,
  openaiModel,
  bedrockModel,
} = {}) {
  const normalized = normalizeNoteEffectiveProvider(effectiveProvider);

  if (isRequestyEffectiveNoteProvider(normalized)) {
    const config = getNoteProviderConfig(normalized);
    return String(config.requestyModel || DEFAULTS.requestyModel || '').trim() || null;
  }

  if (isBedrockEffectiveNoteProvider(normalized)) {
    return String(bedrockModel || DEFAULTS.bedrockModel || '').trim() || null;
  }

  if (isMistralEffectiveNoteProvider(normalized)) {
    return 'mistral-large-latest';
  }

  if (isOpenAiEffectiveNoteProvider(normalized)) {
    const config = getNoteProviderConfig(normalized);
    return String(config.openaiModel || normalizeOpenAiModel(openaiModel)).trim() || null;
  }

  return String(openaiModel || '').trim() || null;
}

export function getNoteUiVisibility({ provider, openaiModel, requestyModel } = {}) {
  const uiProvider = String(provider || DEFAULTS.noteProvider).trim().toLowerCase();
  const reqModel = normalizeRequestyModel(requestyModel);

  const isOpenAi = uiProvider === 'openai';
  const isRequesty = uiProvider === 'requesty';
  const usesDedicatedRequestyReasoning =
    isRequesty &&
    (reqModel === 'claude-opus-5-5' ||
      reqModel === 'gpt-5-nano' ||
      reqModel === 'gemini-3.8-flash' ||
      REQUESTY_DEEPSEEK_MODELS.has(reqModel) ||
      reqModel === 'kimi-k3' ||
      REQUESTY_GPT6_MODELS.has(reqModel) ||
      REQUESTY_GPT56_MODELS.has(reqModel));

  // Streaming/non-streaming (#noteProviderMode) is available for all Requesty
  // models. For reasoning, most Requesty models share the OpenAI selector
  // (#gpt5Reasoning, None/Low/Medium/High). Claude Sonnet 5 maps
  // reasoning_effort to a thinking budget ("None" omits it), while GPT-5.5
  // uses the native OpenAI effort string. Claude Opus 5.5, GPT-5 Nano,
  // GPT-5.6, GPT-6 Luna/Sol, Gemini 3.8 Flash, DeepSeek V4 Pro/V4.1 Flash
  // and Kimi K3 use the dedicated Requesty selector because their valid
  // option sets differ from the shared selector.

  return {
    showOpenAi: isOpenAi,
    showOpenAiMode: isOpenAi || isRequesty,
    showOpenAiReasoning: isOpenAi || (isRequesty && !usesDedicatedRequestyReasoning),
    showRequestyNanoReasoning: usesDedicatedRequestyReasoning,
    showBedrock: uiProvider === 'aws-bedrock',
    showRequesty: isRequesty,
  };
}
