// js/features/provider-persistence.js
//
// Centralized provider persistence + selector UI wiring.
// This module owns:
// - reading/writing provider-related sessionStorage keys
// - keeping provider-specific selector UI visible/hidden
// - delegating runtime provider switches to window.__app when available
//
// It intentionally does NOT own provider engine internals.
// Those stay in js/main.js and the provider modules themselves.

import {
  DEFAULTS,
  deriveNoteUiStateFromEffectiveProvider,
  getDefaultOpenAiReasoning,
  getDefaultRequestyReasoning,
  getNoteUiVisibility,
  getTranscribeActiveApiKeyStorageKey,
  listBedrockModelOptions,
  listNoteModeOptions,
  listNoteUiProviderOptions,
  listOpenAiModelOptions,
  listOpenAiReasoningOptions,
  listSharedRequestyReasoningOptions,
  listRequestyModelOptions,
  listRequestyNanoReasoningOptions,
  listSonioxRegionOptions,
  listSonioxSpeakerLabelOptions,
  listTranscribeProviderOptions,
  normalizeNoteMode,
  normalizeOpenAiModel,
  normalizeOpenAiReasoning,
  normalizeRequestyModel,
  normalizeRequestyNanoReasoning,
  normalizeSharedRequestyReasoning,
  normalizeTranscribeProvider,
  resolveEffectiveNoteProvider,
} from '../core/provider-registry.js';

(function initProviderPersistenceModule() {
  const STORAGE_KEYS = {
    activeApiKey: 'user_api_key',

    transcribeProvider: 'transcribe_provider',
    sonioxRegion: 'soniox_region',
    sonioxSpeakerLabels: 'soniox_speaker_labels',

    noteProvider: 'note_provider',
    noteProviderMode: 'note_provider_mode',
    openaiModel: 'openai_model',
    openaiReasoning: 'openai_reasoning',
    bedrockModel: 'bedrock_model',
    requestyModel: 'requesty_model',
    requestyNanoReasoning: 'requesty_nano_reasoning',
  };

  function getApp() {
    return window.__app || {};
  }

  function readSession(key, fallback = '') {
    try {
      const value = sessionStorage.getItem(key);
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeSession(key, value) {
    try {
      sessionStorage.setItem(key, String(value ?? ''));
    } catch {}
  }

  function normalizeLower(value, fallback = '') {
    const next = String(value ?? '').trim().toLowerCase();
    return next || fallback;
  }

  function setDisplay(el, show, displayValue = 'flex') {
    if (!el) return;
    el.style.display = show ? displayValue : 'none';
  }

  function getOptionSignature(options) {
    return (Array.isArray(options) ? options : [])
      .map((item) => `${String(item?.value || '').trim()}|${String(item?.label || item?.value || '').trim()}`)
      .join('||');
  }

  function ensureSelectOptions(selectEl, options) {
    if (!selectEl) return;

    const normalizedOptions = (Array.isArray(options) ? options : []).map((item) => ({
      value: String(item?.value || '').trim(),
      label: String(item?.label || item?.value || '').trim(),
    }));

    const nextSignature = getOptionSignature(normalizedOptions);
    if (selectEl.dataset.optionsSignature === nextSignature) return;

    const previousValue = String(selectEl.value || '').trim();
    selectEl.innerHTML = '';

    normalizedOptions.forEach((item) => {
      const optionEl = selectEl.ownerDocument.createElement('option');
      optionEl.value = item.value;
      optionEl.textContent = item.label;
      selectEl.appendChild(optionEl);
    });

    selectEl.dataset.optionsSignature = nextSignature;

    if (normalizedOptions.some((item) => item.value === previousValue)) {
      selectEl.value = previousValue;
    }
  }

  function isSoniox(providerValue) {
    // Any Soniox variant — used to decide whether to show Soniox-shared
    // selectors like the Region dropdown. Both the async (soniox) and the
    // real-time (soniox_rt) provider talk to the same Soniox account, so
    // they share region + API key UI.
    const normalized = normalizeTranscribeProvider(providerValue);
    return normalized === 'soniox' || normalized === 'soniox_rt';
  }

  function supportsSonioxSpeakerLabels(providerValue) {
    // Speaker diarization is only meaningful for the async/batch flow
    // (the 'async-diarized' mode inside soniox.js). The real-time
    // WebSocket provider streams plain final tokens, so the speaker-labels
    // selector must stay hidden when soniox_rt is active.
    return normalizeTranscribeProvider(providerValue) === 'soniox';
  }

  function readSelectedTranscribeProvider() {
    return normalizeTranscribeProvider(
      readSession(STORAGE_KEYS.transcribeProvider, DEFAULTS.transcribeProvider)
    );
  }

  function persistSelectedTranscribeProvider(providerValue) {
    const provider = normalizeTranscribeProvider(providerValue);
    writeSession(STORAGE_KEYS.transcribeProvider, provider);

    if (
      String(providerValue || '').trim().toLowerCase() === 'soniox_dia' ||
      normalizeLower(readSession(STORAGE_KEYS.sonioxSpeakerLabels, ''), '') === 'on'
    ) {
      // Back-compat for old soniox_dia sessions is preserved by forcing speaker labels on.
      if (String(providerValue || '').trim().toLowerCase() === 'soniox_dia') {
        writeSession(STORAGE_KEYS.sonioxSpeakerLabels, 'on');
      }
    }

    const activeKeyStorage = getTranscribeActiveApiKeyStorageKey(provider);
    const activeKey = readSession(activeKeyStorage, '');
    writeSession(STORAGE_KEYS.activeApiKey, activeKey);

    return provider;
  }

  function applyTranscribeProviderUI({
    providerSelect,
    regionContainer,
    regionSelect,
    regionNote,
    speakerContainer,
    speakerSelect,
    providerValue,
  }) {
    const provider = normalizeTranscribeProvider(providerValue);
    const showSoniox = isSoniox(provider);
    const showSpeakerLabels = supportsSonioxSpeakerLabels(provider);
    const region = normalizeLower(regionSelect?.value, DEFAULTS.sonioxRegion);

    if (providerSelect && providerSelect.value !== provider) {
      providerSelect.value = provider;
    }

    // Region container shows for both async and real-time Soniox.
    setDisplay(regionContainer, showSoniox, 'block');
    // Speaker-labels container shows ONLY for async Soniox.
    setDisplay(speakerContainer, showSpeakerLabels, 'block');

    if (regionNote) {
      regionNote.style.display = showSoniox && region === 'eu' ? 'block' : 'none';
    }

    if (speakerSelect) {
      const speakerLabels = normalizeLower(
        readSession(STORAGE_KEYS.sonioxSpeakerLabels, DEFAULTS.sonioxSpeakerLabels),
        DEFAULTS.sonioxSpeakerLabels
      );
      if (speakerSelect.value !== speakerLabels) {
        speakerSelect.value = speakerLabels;
      }
    }

    if (regionSelect) {
      const storedRegion = normalizeLower(
        readSession(STORAGE_KEYS.sonioxRegion, DEFAULTS.sonioxRegion),
        DEFAULTS.sonioxRegion
      );
      if (regionSelect.value !== storedRegion) {
        regionSelect.value = storedRegion;
      }
    }
  }

  function readSelectedNoteState() {
    const effectiveProvider = normalizeLower(
      readSession(STORAGE_KEYS.noteProvider, DEFAULTS.noteProvider),
      DEFAULTS.noteProvider
    );
    const storedMode = normalizeNoteMode(
      readSession(STORAGE_KEYS.noteProviderMode, DEFAULTS.noteMode)
    );
    const ui = deriveNoteUiStateFromEffectiveProvider(effectiveProvider, storedMode);
    const requestyModel = normalizeRequestyModel(
      readSession(STORAGE_KEYS.requestyModel, ui.requestyModel || DEFAULTS.requestyModel)
    );
    const storedRequestyReasoning = readSession(STORAGE_KEYS.requestyNanoReasoning, null);
    // The effective provider is authoritative while direct OpenAI is selected.
    // Otherwise retain the last direct OpenAI choice for a later switch back.
    const openaiModel = normalizeOpenAiModel(
      ui.provider === 'openai'
        ? ui.openaiModel
        : readSession(STORAGE_KEYS.openaiModel, DEFAULTS.openaiModel)
    );

    return {
      effectiveProvider: ui.effectiveProvider,
      provider: ui.provider,
      openaiModel,
      openaiReasoning:
        ui.provider === 'openai'
          ? normalizeOpenAiReasoning(
              readSession(STORAGE_KEYS.openaiReasoning, getDefaultOpenAiReasoning()),
              openaiModel
            )
          : normalizeSharedRequestyReasoning(
              readSession(STORAGE_KEYS.openaiReasoning, 'low')
            ),
      mode: ui.mode,
      bedrockModel: normalizeLower(
        readSession(STORAGE_KEYS.bedrockModel, DEFAULTS.bedrockModel),
        DEFAULTS.bedrockModel
      ),
      requestyModel,
      requestyNanoReasoning: normalizeRequestyNanoReasoning(
        storedRequestyReasoning == null
          ? getDefaultRequestyReasoning(requestyModel)
          : storedRequestyReasoning,
        requestyModel
      ),
    };
  }

  function persistSelectedNoteState({
    provider,
    openaiModel,
    openaiReasoning,
    noteMode,
    bedrockModel,
    requestyModel,
    requestyNanoReasoning,
  }) {
    const effectiveProvider = resolveEffectiveNoteProvider({
      provider,
      openaiModel,
      noteMode,
      requestyModel,
    });

    const normalizedOpenAiModel = normalizeOpenAiModel(openaiModel);
    writeSession(STORAGE_KEYS.noteProvider, effectiveProvider);
    writeSession(STORAGE_KEYS.noteProviderMode, normalizeNoteMode(noteMode));
    writeSession(STORAGE_KEYS.openaiModel, normalizedOpenAiModel);
    writeSession(
      STORAGE_KEYS.openaiReasoning,
      normalizeLower(provider) === 'openai'
        ? normalizeOpenAiReasoning(openaiReasoning, normalizedOpenAiModel)
        : normalizeSharedRequestyReasoning(openaiReasoning)
    );
    writeSession(STORAGE_KEYS.bedrockModel, normalizeLower(bedrockModel, DEFAULTS.bedrockModel));
    writeSession(STORAGE_KEYS.requestyModel, normalizeRequestyModel(requestyModel));
    writeSession(
      STORAGE_KEYS.requestyNanoReasoning,
      normalizeRequestyNanoReasoning(requestyNanoReasoning, requestyModel)
    );

    return effectiveProvider;
  }

  function applyNoteProviderUI({
    providerSelect,
    openaiModelContainer,
    openaiModelSelect,
    openaiReasoningContainer,
    openaiReasoningSelect,
    noteModeContainer,
    noteModeSelect,
    bedrockModelContainer,
    bedrockModelSelect,
    requestyModelContainer,
    requestyModelSelect,
    requestyNanoReasoningContainer,
    requestyNanoReasoningSelect,
    providerValue,
  }) {
    const selectedProvider = normalizeLower(providerValue, DEFAULTS.noteProvider);
    const selectedOpenAiModel = normalizeOpenAiModel(openaiModelSelect?.value);
    const selectedRequestyModel = normalizeRequestyModel(requestyModelSelect?.value);
    const selectedRequestyReasoning = normalizeRequestyNanoReasoning(
      requestyNanoReasoningSelect?.value,
      selectedRequestyModel
    );
    const visibility = getNoteUiVisibility({
      provider: selectedProvider,
      openaiModel: selectedOpenAiModel,
      requestyModel: selectedRequestyModel,
    });

    ensureSelectOptions(
      openaiReasoningSelect,
      selectedProvider === 'openai'
        ? listOpenAiReasoningOptions(selectedOpenAiModel)
        : listSharedRequestyReasoningOptions()
    );
    ensureSelectOptions(requestyModelSelect, listRequestyModelOptions());
    ensureSelectOptions(
      requestyNanoReasoningSelect,
      listRequestyNanoReasoningOptions(selectedRequestyModel)
    );

    if (openaiReasoningSelect) {
      const normalizedOpenAiReasoning =
        selectedProvider === 'openai'
          ? normalizeOpenAiReasoning(openaiReasoningSelect.value, selectedOpenAiModel)
          : normalizeSharedRequestyReasoning(openaiReasoningSelect.value);
      if (openaiReasoningSelect.value !== normalizedOpenAiReasoning) {
        openaiReasoningSelect.value = normalizedOpenAiReasoning;
      }
    }

    if (
      requestyNanoReasoningSelect &&
      requestyNanoReasoningSelect.value !== selectedRequestyReasoning
    ) {
      requestyNanoReasoningSelect.value = selectedRequestyReasoning;
    }

    if (providerSelect && providerSelect.value !== selectedProvider) {
      providerSelect.value = selectedProvider;
    }
    if (openaiModelSelect && openaiModelSelect.value !== selectedOpenAiModel) {
      openaiModelSelect.value = selectedOpenAiModel;
    }

    setDisplay(openaiModelContainer, visibility.showOpenAi);
    setDisplay(openaiReasoningContainer, visibility.showOpenAiReasoning);
    setDisplay(noteModeContainer, visibility.showOpenAiMode);
    setDisplay(bedrockModelContainer, visibility.showBedrock);
    setDisplay(requestyModelContainer, visibility.showRequesty);
    setDisplay(requestyNanoReasoningContainer, visibility.showRequestyNanoReasoning);

    if (noteModeSelect && !visibility.showOpenAiMode && noteModeSelect.value !== DEFAULTS.noteMode) {
      noteModeSelect.value = DEFAULTS.noteMode;
    }

    if (bedrockModelSelect && !bedrockModelSelect.value) {
      bedrockModelSelect.value = DEFAULTS.bedrockModel;
    }

    if (requestyModelSelect && !requestyModelSelect.value) {
      requestyModelSelect.value = DEFAULTS.requestyModel;
    }

    const noteCoordinator = getApp();
    if (typeof noteCoordinator.renderNoteUsageCost === 'function') {
      try {
        noteCoordinator.renderNoteUsageCost();
      } catch (_) {}
    }
  }

  async function performRuntimeSwitch({
    isBusy,
    switcher,
    fallbackLabel,
    nextValue,
  }) {
    const app = getApp();
    const busyNow = typeof isBusy === 'function' ? !!isBusy() : false;

    if (busyNow) {
      if (typeof app.reloadWithSavedState === 'function') {
        app.reloadWithSavedState(`${fallbackLabel}: busy state requires reload`);
        return false;
      }

      if (typeof app.saveState === 'function') {
        try { app.saveState(); } catch (_) {}
      }
      window.location.reload();
      return false;
    }

    if (typeof switcher === 'function') {
      try {
        await switcher(nextValue);
        return true;
      } catch (err) {
        console.warn(`${fallbackLabel} failed, falling back to reload`, err);
      }
    }

    if (typeof app.reloadWithSavedState === 'function') {
      app.reloadWithSavedState(`${fallbackLabel} failed, falling back to reload`);
      return false;
    }

    if (typeof app.saveState === 'function') {
      try { app.saveState(); } catch (_) {}
    }
    window.location.reload();
    return false;
  }

  function initTranscribeProviderPersistence() {
    const providerSelect = document.getElementById('transcribeProvider');
    if (!providerSelect) return;

    const regionContainer = document.getElementById('soniox-region-container');
    const regionSelect = document.getElementById('sonioxRegion');
    const regionNote = document.getElementById('soniox-region-note');
    const speakerContainer = document.getElementById('soniox-speaker-labels-container');
    const speakerSelect = document.getElementById('sonioxSpeakerLabels');

    if (providerSelect.dataset.providerPersistenceBound === '1') return;
    providerSelect.dataset.providerPersistenceBound = '1';

    ensureSelectOptions(providerSelect, listTranscribeProviderOptions());
    ensureSelectOptions(regionSelect, listSonioxRegionOptions());
    ensureSelectOptions(speakerSelect, listSonioxSpeakerLabelOptions());

    const storedProvider = persistSelectedTranscribeProvider(readSelectedTranscribeProvider());

    if (regionSelect) {
      const storedRegion = normalizeLower(
        readSession(STORAGE_KEYS.sonioxRegion, DEFAULTS.sonioxRegion),
        DEFAULTS.sonioxRegion
      );
      regionSelect.value = storedRegion;
      regionSelect.addEventListener('change', () => {
        const nextRegion = normalizeLower(regionSelect.value, DEFAULTS.sonioxRegion);
        writeSession(STORAGE_KEYS.sonioxRegion, nextRegion);
        applyTranscribeProviderUI({
          providerSelect,
          regionContainer,
          regionSelect,
          regionNote,
          speakerContainer,
          speakerSelect,
          providerValue: providerSelect.value,
        });
      });
    }

    if (speakerSelect) {
      const storedSpeaker = normalizeLower(
        readSession(STORAGE_KEYS.sonioxSpeakerLabels, DEFAULTS.sonioxSpeakerLabels),
        DEFAULTS.sonioxSpeakerLabels
      );
      speakerSelect.value = storedSpeaker;
      speakerSelect.addEventListener('change', async () => {
        const nextSpeaker = normalizeLower(speakerSelect.value, DEFAULTS.sonioxSpeakerLabels);
        writeSession(STORAGE_KEYS.sonioxSpeakerLabels, nextSpeaker);

        applyTranscribeProviderUI({
          providerSelect,
          regionContainer,
          regionSelect,
          regionNote,
          speakerContainer,
          speakerSelect,
          providerValue: providerSelect.value,
        });

        if (!isSoniox(providerSelect.value)) return;
        const busyNow = !!getApp().isTranscribeBusy?.();
        if (busyNow) {
          console.warn('Soft recording switch (speaker labels) ignored while transcription is busy.');
          return;
        }

        try {
          await getApp().switchTranscribeProvider?.('soniox');
        } catch (err) {
          console.warn('Soft recording switch (speaker labels) failed without reload', err);
        }
      });
    }

    applyTranscribeProviderUI({
      providerSelect,
      regionContainer,
      regionSelect,
      regionNote,
      speakerContainer,
      speakerSelect,
      providerValue: storedProvider,
    });

    providerSelect.addEventListener('change', async () => {
      const provider = persistSelectedTranscribeProvider(providerSelect.value);

      applyTranscribeProviderUI({
        providerSelect,
        regionContainer,
        regionSelect,
        regionNote,
        speakerContainer,
        speakerSelect,
        providerValue: provider,
      });

      const busyNow = !!getApp().isTranscribeBusy?.();
      if (busyNow) {
        console.warn('Soft recording switch ignored while transcription is busy.');
        return;
      }

      try {
        await getApp().switchTranscribeProvider?.(provider);
      } catch (err) {
        console.warn('Soft recording switch failed without reload', err);
      }
    });
  }

  function initNoteProviderPersistence() {
    const providerSelect = document.getElementById('noteProvider');
    if (!providerSelect) return;
    if (providerSelect.dataset.noteProviderPersistenceBound === '1') return;
    providerSelect.dataset.noteProviderPersistenceBound = '1';

    const openaiModelContainer = document.getElementById('openai-model-container');
    const openaiModelSelect = document.getElementById('openaiModel');
    const openaiReasoningContainer = document.getElementById('gpt5-reasoning-container');
    const openaiReasoningSelect = document.getElementById('gpt5Reasoning');
    const noteModeContainer = document.getElementById('note-provider-mode-container');
    const noteModeSelect = document.getElementById('noteProviderMode');
    const bedrockModelContainer = document.getElementById('bedrock-model-container');
    const bedrockModelSelect = document.getElementById('bedrockModel');
    const requestyModelContainer = document.getElementById('requesty-model-container');
    const requestyModelSelect = document.getElementById('requestyModel');
    const requestyNanoReasoningContainer = document.getElementById('requesty-nano-reasoning-container');
    const requestyNanoReasoningSelect = document.getElementById('requestyNanoReasoning');

    ensureSelectOptions(providerSelect, listNoteUiProviderOptions());
    ensureSelectOptions(openaiModelSelect, listOpenAiModelOptions());
    ensureSelectOptions(noteModeSelect, listNoteModeOptions());
    ensureSelectOptions(bedrockModelSelect, listBedrockModelOptions());
    const stored = readSelectedNoteState();
    ensureSelectOptions(
      openaiReasoningSelect,
      stored.provider === 'openai'
        ? listOpenAiReasoningOptions(stored.openaiModel)
        : listSharedRequestyReasoningOptions()
    );
    // Migrate stale sessions that still name a provider removed from the
    // registry to the current safe default immediately.
    writeSession(STORAGE_KEYS.noteProvider, stored.effectiveProvider);
    writeSession(STORAGE_KEYS.openaiModel, stored.openaiModel);
    writeSession(STORAGE_KEYS.openaiReasoning, stored.openaiReasoning);

    ensureSelectOptions(requestyModelSelect, listRequestyModelOptions());
    if (requestyModelSelect) requestyModelSelect.value = stored.requestyModel;
    ensureSelectOptions(
      requestyNanoReasoningSelect,
      listRequestyNanoReasoningOptions(stored.requestyModel)
    );

    providerSelect.value = stored.provider;
    if (openaiModelSelect) openaiModelSelect.value = stored.openaiModel;
    if (openaiReasoningSelect) openaiReasoningSelect.value = stored.openaiReasoning;
    if (noteModeSelect) noteModeSelect.value = stored.mode;
    if (bedrockModelSelect) bedrockModelSelect.value = stored.bedrockModel;
    if (requestyNanoReasoningSelect) requestyNanoReasoningSelect.value = stored.requestyNanoReasoning;

    applyNoteProviderUI({
      providerSelect,
      openaiModelContainer,
      openaiModelSelect,
      openaiReasoningContainer,
      openaiReasoningSelect,
      noteModeContainer,
      noteModeSelect,
      bedrockModelContainer,
      bedrockModelSelect,
      requestyModelContainer,
      requestyModelSelect,
      requestyNanoReasoningContainer,
      requestyNanoReasoningSelect,
      providerValue: stored.provider,
    });

    const persistAndSwitchNoteProvider = async () => {
      const effectiveProvider = persistSelectedNoteState({
        provider: providerSelect.value,
        openaiModel: openaiModelSelect?.value || DEFAULTS.openaiModel,
        openaiReasoning:
          openaiReasoningSelect?.value || getDefaultOpenAiReasoning(),
        noteMode: noteModeSelect?.value || DEFAULTS.noteMode,
        bedrockModel: bedrockModelSelect?.value || DEFAULTS.bedrockModel,
        requestyModel: requestyModelSelect?.value || DEFAULTS.requestyModel,
        requestyNanoReasoning:
          requestyNanoReasoningSelect?.value ||
          getDefaultRequestyReasoning(requestyModelSelect?.value || DEFAULTS.requestyModel),
      });

      applyNoteProviderUI({
        providerSelect,
        openaiModelContainer,
        openaiModelSelect,
        openaiReasoningContainer,
        openaiReasoningSelect,
        noteModeContainer,
        noteModeSelect,
        bedrockModelContainer,
        bedrockModelSelect,
        requestyModelContainer,
        requestyModelSelect,
        requestyNanoReasoningContainer,
        requestyNanoReasoningSelect,
        providerValue: providerSelect.value,
      });

      const busyNow = !!getApp().isNoteGenerationBusy?.();
      if (busyNow) {
        console.warn('Soft note switch ignored while note generation is busy.');
        return;
      }

      try {
        await getApp().switchNoteProvider?.(effectiveProvider);
      } catch (err) {
        console.warn('Soft note switch failed without reload', err);
      }
    };

    providerSelect.addEventListener('change', persistAndSwitchNoteProvider);
    openaiModelSelect?.addEventListener('change', async () => {
      const modelId = normalizeOpenAiModel(openaiModelSelect.value);
      if (openaiModelSelect.value !== modelId) openaiModelSelect.value = modelId;
      const previousReasoning = String(openaiReasoningSelect?.value || '');
      ensureSelectOptions(openaiReasoningSelect, listOpenAiReasoningOptions(modelId));
      const normalizedReasoning = normalizeOpenAiReasoning(previousReasoning, modelId);
      if (openaiReasoningSelect) openaiReasoningSelect.value = normalizedReasoning;
      writeSession(STORAGE_KEYS.openaiReasoning, normalizedReasoning);
      await persistAndSwitchNoteProvider();
    });
    // Switching the Requesty model changes the EFFECTIVE provider
    // (requesty-claude <-> requesty-gpt6-* <-> requesty-gpt55 <-> requesty-gpt56-*), so run the full
    // persist-and-switch path — same as the OpenAI model selector.
    requestyModelSelect?.addEventListener('change', async () => {
      const modelId = normalizeRequestyModel(requestyModelSelect.value);
      ensureSelectOptions(
        requestyNanoReasoningSelect,
        listRequestyNanoReasoningOptions(modelId)
      );
      if (requestyNanoReasoningSelect) {
        if (modelId.startsWith('gpt-6-')) {
          const storedReasoning = readSession(STORAGE_KEYS.requestyNanoReasoning, null);
          requestyNanoReasoningSelect.value = normalizeRequestyNanoReasoning(
            storedReasoning == null
              ? getDefaultRequestyReasoning(modelId)
              : storedReasoning,
            modelId
          );
        } else if (
          modelId === 'claude-opus-5-5' ||
          modelId === 'gemini-3.8-flash' ||
          modelId.startsWith('deepseek-')
        ) {
          requestyNanoReasoningSelect.value = getDefaultRequestyReasoning(modelId);
        }
      }
      await persistAndSwitchNoteProvider();
    });
    // Changing the dedicated Requesty reasoning effort does not change the
    // effective provider, so just persist it.
    requestyNanoReasoningSelect?.addEventListener('change', () => {
      writeSession(
        STORAGE_KEYS.requestyNanoReasoning,
        normalizeRequestyNanoReasoning(
          requestyNanoReasoningSelect.value,
          requestyModelSelect?.value || DEFAULTS.requestyModel
        )
      );
    });
    openaiReasoningSelect?.addEventListener('change', () => {
      writeSession(
        STORAGE_KEYS.openaiReasoning,
        providerSelect.value === 'openai'
          ? normalizeOpenAiReasoning(
              openaiReasoningSelect.value,
              openaiModelSelect?.value || DEFAULTS.openaiModel
            )
          : normalizeSharedRequestyReasoning(openaiReasoningSelect.value)
      );
    });
    noteModeSelect?.addEventListener('change', persistAndSwitchNoteProvider);

    bedrockModelSelect?.addEventListener('change', () => {
      writeSession(STORAGE_KEYS.bedrockModel, normalizeLower(bedrockModelSelect.value, DEFAULTS.bedrockModel));
      applyNoteProviderUI({
        providerSelect,
        openaiModelContainer,
        openaiModelSelect,
        openaiReasoningContainer,
        openaiReasoningSelect,
        noteModeContainer,
        noteModeSelect,
        bedrockModelContainer,
        bedrockModelSelect,
        requestyModelContainer,
        requestyModelSelect,
        requestyNanoReasoningContainer,
        requestyNanoReasoningSelect,
        providerValue: providerSelect.value,
      });
    });
  }

  function init() {
    initTranscribeProviderPersistence();
    initNoteProviderPersistence();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
