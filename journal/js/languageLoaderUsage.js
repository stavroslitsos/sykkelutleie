import { loadLanguageModule } from './languageLoader.js';
import { initIndexAccordions } from './ui.js';
import { registerWorkspaceDisposer } from './core/workspace-disposal.js';

// For the index page
export async function initIndexLanguage() {
  let currentLang = localStorage.getItem("siteLanguage") || "en";
  const langSelect = document.getElementById("lang-select");
  if (!langSelect) return;
  langSelect.value = currentLang;
  
  // Load the language module and update the index page UI
  const mod = await loadLanguageModule(currentLang);
  console.log("Loaded index language module:", mod);
  const indexTranslations = mod?.indexTranslations || mod?.default?.indexTranslations;
  if (!indexTranslations) {
    console.error("Index translations not found for language:", currentLang);
    return;
  }
  updateIndexUI(indexTranslations);
  // Reinitialize accordion behavior after UI text updates.
  initIndexAccordions();
  
  // Listen for language changes
  langSelect.addEventListener("change", async function() {
    currentLang = this.value;
    localStorage.setItem("siteLanguage", currentLang);
    const mod = await loadLanguageModule(currentLang);
    console.log("Loaded index language module on change:", mod);
    const indexTranslations = mod?.indexTranslations || mod?.default?.indexTranslations;
    if (!indexTranslations) {
      console.error("Index translations not found for language:", currentLang);
      return;
    }
    updateIndexUI(indexTranslations);
    initIndexAccordions();
  });
}

// Update the index page elements with the translations
function updateIndexUI(trans) {
  const pageTitleEl = document.getElementById("page-title");
  if (pageTitleEl) pageTitleEl.textContent = trans.pageTitle;

  const headerTitleEl = document.getElementById("header-title");
  if (headerTitleEl) headerTitleEl.textContent = trans.headerTitle;

  const headerSubtitleEl = document.getElementById("header-subtitle");
  if (headerSubtitleEl) headerSubtitleEl.textContent = trans.headerSubtitle;

  const startTextEl = document.getElementById("start-text");
  if (startTextEl) startTextEl.textContent = trans.startText;

  // Provider columns (optional; exists after the 2-column layout change)
  const gdprTitleEl = document.getElementById("gdpr-column-title");
  if (gdprTitleEl) gdprTitleEl.textContent = trans.gdprColumnTitle ?? gdprTitleEl.textContent;
  const gdprFootEl = document.getElementById("gdpr-column-footnote");
  if (gdprFootEl) gdprFootEl.textContent = trans.gdprColumnFootnote ?? gdprFootEl.textContent;
  const nonGdprTitleEl = document.getElementById("nongdpr-column-title");
  if (nonGdprTitleEl) nonGdprTitleEl.textContent = trans.nonGdprColumnTitle ?? nonGdprTitleEl.textContent;
  const nonGdprFootEl = document.getElementById("nongdpr-column-footnote");
  if (nonGdprFootEl) nonGdprFootEl.textContent = trans.nonGdprColumnFootnote ?? nonGdprFootEl.textContent;

  // Optional helper text blocks (may be absent or untranslated in some language packs)
  const keysIoHintEl = document.getElementById("keysIoHint");
  if (keysIoHintEl && trans.keysIoHint) {
    keysIoHintEl.textContent = trans.keysIoHint;
  }

  const apiKeyInputEl = document.getElementById("apiKeyInput");
  if (apiKeyInputEl) apiKeyInputEl.placeholder = trans.apiPlaceholder;

  const enterBtnEl = document.getElementById("enterTranscriptionBtn");
  if (enterBtnEl) enterBtnEl.textContent = trans.enterButton;

  const guideBtn = document.getElementById("openGuideButton");
  if (guideBtn) guideBtn.textContent = trans.guideButton;

  const securityBtn = document.getElementById("openSecurityButton");
  if (securityBtn) securityBtn.textContent = trans.securityButton;

  const aboutBtn = document.getElementById("openAboutButton");
  if (aboutBtn) aboutBtn.textContent = trans.aboutButton;


  const offerElem = document.getElementById("offerText");
  if (offerElem && trans.offerText) {
    offerElem.innerHTML = trans.offerText;
  }

  // New: AI-models accordion content
  const modelsContent = document.getElementById("modelsModalText");
  if (modelsContent && trans.modelsModalText != null) {
    modelsContent.innerHTML = trans.modelsModalText;
    modelsContent.querySelectorAll("a").forEach(anchor => {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    });
  }

  const guideContent = document.getElementById("guide-p1");
  if (guideContent) {
    guideContent.innerHTML = trans.guideModalText;
    guideContent.querySelectorAll("a").forEach(anchor => {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    });
  }

  const priceContent = document.getElementById("priceModalText");
  if (priceContent) {
    priceContent.innerHTML = trans.priceModalText;
  }
  const securityContent = document.getElementById("securityModalText");
  if (securityContent) {
    securityContent.innerHTML = trans.securityModalText;
  }
  const aboutContent = document.getElementById("aboutModalText");
  if (aboutContent) {
    aboutContent.innerHTML = trans.aboutModalText;
  }

  const accordionHeaders = document.querySelectorAll('.accordion .accordion-header');
  // Support both old (4 tabs) and new (5 tabs) index.html layouts
  if (accordionHeaders.length >= 5) {
    accordionHeaders[0].textContent = trans.modelsModalHeading ?? accordionHeaders[0].textContent;
    accordionHeaders[1].textContent = trans.guideModalHeading ?? accordionHeaders[1].textContent;
    accordionHeaders[2].textContent = trans.priceModalHeading ?? accordionHeaders[2].textContent;
    accordionHeaders[3].textContent = trans.securityModalHeading ?? accordionHeaders[3].textContent;
    accordionHeaders[4].textContent = trans.aboutModalHeading ?? accordionHeaders[4].textContent;
  } else if (accordionHeaders.length >= 4) {
    accordionHeaders[0].textContent = trans.guideModalHeading ?? accordionHeaders[0].textContent;
    accordionHeaders[1].textContent = trans.priceModalHeading ?? accordionHeaders[1].textContent;
    accordionHeaders[2].textContent = trans.securityModalHeading ?? accordionHeaders[2].textContent;
    accordionHeaders[3].textContent = trans.aboutModalHeading ?? accordionHeaders[3].textContent;
  }

  const activeHeader = document.querySelector('.accordion-header.active');
  if (activeHeader) {
    const contentId = activeHeader.getAttribute('data-content-id');
    const hiddenContent = document.getElementById(contentId);
    const contentContainer = document.querySelector('.accordion-content-container');
    if (hiddenContent && contentContainer) {
      contentContainer.innerHTML = hiddenContent.innerHTML;
    }
  }
}

// For the transcribe page
export async function initTranscribeLanguage() {
  let currentLang = localStorage.getItem("siteLanguage") || "en";
  const langSelect = document.getElementById("lang-select-transcribe");
  if (!langSelect) return;
  langSelect.value = currentLang;
  
  // Load and update UI for the current language
  const mod = await loadLanguageModule(currentLang);
  console.log("Loaded transcribe language module:", mod);
  const transcribeTranslations = mod?.transcribeTranslations || mod?.default?.transcribeTranslations;
  if (!transcribeTranslations) {
    console.error("Transcribe translations not found for language:", currentLang);
    return;
  }
  updateTranscribeUI(transcribeTranslations);
  try {
    window.dispatchEvent(new CustomEvent("transcribe-language-updated", {
      detail: {
        lang: currentLang,
        translations: transcribeTranslations
      }
    }));
  } catch (_) {}
  
  // Listen for language changes using the "change" event
  langSelect.addEventListener("change", async function() {
    currentLang = this.value;
    localStorage.setItem("siteLanguage", currentLang);
    const mod = await loadLanguageModule(currentLang);
    console.log("Loaded transcribe language module on change:", mod);
    const transcribeTranslations = mod?.transcribeTranslations || mod?.default?.transcribeTranslations;
    if (!transcribeTranslations) {
      console.error("Transcribe translations not found for language:", currentLang);
      return;
    }
    updateTranscribeUI(transcribeTranslations);
    try {
      window.dispatchEvent(new CustomEvent("transcribe-language-updated", {
        detail: {
          lang: currentLang,
          translations: transcribeTranslations
        }
      }));
    } catch (_) {}
  });
  
  // Also listen for "click" events to force an update even if the same language is re-selected
  langSelect.addEventListener("click", async function() {
    const mod = await loadLanguageModule(this.value);
    console.log("Loaded transcribe language module on click:", mod);
    const transcribeTranslations = mod?.transcribeTranslations || mod?.default?.transcribeTranslations;
    if (!transcribeTranslations) {
      console.error("Transcribe translations not found for language:", this.value);
      return;
    }
    updateTranscribeUI(transcribeTranslations);
    try {
      window.dispatchEvent(new CustomEvent("transcribe-language-updated", {
        detail: {
          lang: this.value,
          translations: transcribeTranslations
        }
      }));
    } catch (_) {}
  });
}

function setTextIfPresent(id, value) {
  const el = document.getElementById(id);
  if (el && typeof value === "string") {
    el.textContent = value;
  }
}

function setHtmlIfPresent(id, value) {
  const el = document.getElementById(id);
  if (el && typeof value === "string") {
    el.innerHTML = value;
  }
}

function setPlaceholderIfPresent(id, value) {
  const el = document.getElementById(id);
  if (el && typeof value === "string") {
    el.placeholder = value;
  }
}

function setAttrIfPresent(id, attr, value) {
  const el = document.getElementById(id);
  if (el && typeof value === "string") {
    el.setAttribute(attr, value);
  }
}

function getRedactorI18n(trans) {
  const currentLang = localStorage.getItem("siteLanguage") || "en";
  const isNorwegian = currentLang === "no";

  const fallback = isNorwegian
    ? {
        toggleShow: "Vis redactor",
        toggleHide: "Skjul redactor",
        title: "Redactor",
        help: "Legg til ett begrep per linje. Både generelle og spesifikke begreper brukes når du klikker Redact. Generelle begreper beholdes så lenge denne fanen er åpen, men tømmes når fanen lukkes.",
        ocrSectionTitle: "Skjermbilde → OCR",
        ocrMiniHelp: "Bruk Windows + Shift + S, og klikk deretter <strong>Lim inn bilde</strong>. Du kan også trykke <strong>Ctrl + V</strong> mens bildefeltet er fokusert, eller laste opp en bildefil.",
        pasteImageButton: "Lim inn bilde",
        uploadImageButton: "Last opp bilde",
        clearImageButton: "Tøm bilde",
        fetchSpecificButton: "Hent OCR → Spesifikke",
        fetchRawButton: "Hent OCR → Råtekst",
        imageFrameAriaLabel: "OCR-bildeforhåndsvisning. Lim inn et bilde her med Ctrl pluss V.",
        imagePreviewAlt: "Forhåndsvisning av OCR-skjermbilde",
        imagePlaceholder: "Intet bilde lastet inn ennå. Lim inn et skjermbilde her eller last opp et bilde.",
        generalTermsLabel: "Generelle begreper",
        generalTermsPlaceholder: "Generelle begreper (ett per linje)\nf.eks. sykehus\nNavn",
        importGeneralButton: "Importer General.txt",
        exportGeneralButton: "Eksporter General.txt",
        clearGeneralButton: "Tøm generelle begreper",
        specificTermsLabel: "Spesifikke begreper",
        specificTermsPlaceholder: "Spesifikke begreper (ett per linje)\nf.eks. Ola Nordmann\n01020312345",
        clearSpecificButton: "Tøm spesifikke begreper",
        redactButton: "Sladd",
        rawOutputLabel: "OCR-råtekst",
        rawOutputPlaceholder: "OCR-råtekst vises her...",
        copyRawButton: "Kopier råtekst",
        clearRawButton: "Tøm råtekst",
        birthdateLabel: "Fødselsdatohjelper",
        birthdatePlaceholder: "DDMMÅÅ, f.eks. 180289",
        addDatesButton: "Legg til datoer",
        statusDefault: "",
      }
    : {
        toggleShow: "Show redactor",
        toggleHide: "Hide redactor",
        title: "Redactor",
        help: "Add one term per line. General and specific terms are both used when you click Redact. General terms stay while this tab remains open, but clear when the tab is closed.",
        ocrSectionTitle: "Screenshot → OCR",
        ocrMiniHelp: "Use Windows + Shift + S, then click <strong>Paste image</strong>. You can also press <strong>Ctrl + V</strong> while the image frame is focused, or upload an image file.",
        pasteImageButton: "Paste image",
        uploadImageButton: "Upload image",
        clearImageButton: "Clear image",
        fetchSpecificButton: "Fetch OCR → Specific",
        fetchRawButton: "Fetch OCR → Raw text",
        imageFrameAriaLabel: "OCR image preview. Paste an image here with Ctrl plus V.",
        imagePreviewAlt: "OCR screenshot preview",
        imagePlaceholder: "No image loaded yet. Paste a screenshot here or upload an image.",
        generalTermsLabel: "General terms",
        generalTermsPlaceholder: "General terms (one per line)\ne.g. hospital\nName",
        importGeneralButton: "Import General.txt",
        exportGeneralButton: "Export General.txt",
        clearGeneralButton: "Clear general terms",
        specificTermsLabel: "Specific terms",
        specificTermsPlaceholder: "Specific terms (one per line)\ne.g. John Doe\n01020312345",
        clearSpecificButton: "Clear specific terms",
        redactButton: "Redact",
        rawOutputLabel: "OCR raw text",
        rawOutputPlaceholder: "OCR raw text appears here...",
        copyRawButton: "Copy raw",
        clearRawButton: "Clear raw",
        birthdateLabel: "Birthdate helper",
        birthdatePlaceholder: "DDMMYY, e.g. 180289",
        addDatesButton: "Add dates",
        statusDefault: "",
      };

  return {
    ...fallback,
    ...(trans.redactor || {}),
  };
}

function getSecondaryNoteI18n(trans) {
  const fallback = {
    showButton: "Show secondary note generator",
    hideButton: "Hide secondary note generator",
    title: "Secondary Note Generator",
    sourceLabel: "Source text",
    sourcePlaceholder: "Paste or type source text here...",
    providerLabel: "Provider:",
    modelLabel: "Model:",
    modeLabel: "Mode:",
    reasoningLabel: "Reasoning effort:",
    thinkingLabel: "Thinking level:",
    promptLabel: "Prompt:",
    generateButton: "Generate Note",
    abortButton: "Abort",
    copyButton: "Copy",
    copiedButton: "Copied",
    pushButton: "Insert",
    clearOnGenerateLabel: "Clear Supplementary Information on Generate",
    autoTransferLabel: "Automatically copy result to Supplementary Information",
    sourceDateLabel: "Date",
    sourceDateToggleAriaLabel: "Keep today's date in source text",
    sourceDateHelp:
      'When ON: Keeps the line "Dagens dato er DD.MM.YYYY" at the top of the source text and restores it after refresh. When OFF: Removes that date line from the source text.',
    outputPlaceholder: "Generated note will appear here...",
    timerLabel: "Note Generation Timer",
    statusGenerating: "Generating…",
    statusCompleted: "Text generation completed!",
    statusFailed: "Generation failed",
    statusAborted: "Note generation aborted.",
    noSourceText: "No source text",
    noPromptSelected: "No prompt selected",
    noOutputToPush: "No note to copy over yet",
    transferred: "Result copied to Supplementary Information."
  };

  return {
    ...fallback,
    ...(trans.secondaryNote || {}),
  };
}

function updateSecondaryNoteUI(trans) {
  const s = getSecondaryNoteI18n(trans);

  setTextIfPresent("secondaryNoteTitle", s.title);
  setPlaceholderIfPresent("secondarySourceText", s.sourcePlaceholder);
  setAttrIfPresent("secondarySourceText", "aria-label", s.sourceLabel);
  setTextIfPresent("secondaryProviderLabel", s.providerLabel);
  setTextIfPresent("secondaryOpenaiModelLabel", s.modelLabel);
  setTextIfPresent("secondaryBedrockModelLabel", s.modelLabel);
  setTextIfPresent("secondaryRequestyModelLabel", s.modelLabel);
  setTextIfPresent("secondaryModeLabel", s.modeLabel);
  setTextIfPresent("secondaryOpenaiReasoningLabel", s.reasoningLabel);
  setTextIfPresent("secondaryNanoReasoningLabel", s.reasoningLabel);
  setTextIfPresent("secondaryPromptLabel", s.promptLabel);
  setTextIfPresent("secondaryGenerateButton", s.generateButton);
  setTextIfPresent("secondaryAbortButton", s.abortButton);
  setTextIfPresent("secondaryCopyNoteButton", s.copyButton);
  setTextIfPresent("secondaryPushToSupplementaryButton", s.pushButton);
  setTextIfPresent("secondaryAutoTransferLabel", s.autoTransferLabel);
  setTextIfPresent("secondaryClearOnGenerateLabel", s.clearOnGenerateLabel);
  setTextIfPresent("secondarySourceDateToggleLabel", s.sourceDateLabel);
  setTextIfPresent("secondarySourceDateTooltipText", s.sourceDateHelp);
  setAttrIfPresent(
    "secondarySourceDateToggleWrap",
    "aria-label",
    s.sourceDateToggleAriaLabel
  );
  setAttrIfPresent(
    "secondarySourceDateTooltipContainer",
    "aria-label",
    s.sourceDateToggleAriaLabel
  );
  setPlaceholderIfPresent("secondaryGeneratedNote", s.outputPlaceholder);

  // Show/Hide label depends on the pane's current visibility.
  const pane = document.getElementById("secondaryNotePane");
  const toggleButton = document.getElementById("toggleSecondaryNoteButton");
  if (toggleButton) {
    const isOpen = !!pane && !pane.hidden;
    toggleButton.textContent = isOpen ? s.hideButton : s.showButton;
  }

  // Publish for the feature module (dynamic labels: timer, statuses, toggle).
  window.__secondaryNoteI18n = s;
  try {
    window.dispatchEvent(new CustomEvent("secondary-note-i18n-changed", { detail: s }));
  } catch {}
}

function updateRedactorUI(trans) {
  const redactor = getRedactorI18n(trans);
  const pane = document.getElementById("redactorPane");
  const toggleButton = document.getElementById("toggleRedactorButton");
  const isOpen = !!pane && !pane.hidden;

  setTextIfPresent("redactorTitle", redactor.title);
  setTextIfPresent("redactorHelp", redactor.help);
  setHtmlIfPresent("redactorOcrMiniHelp", redactor.ocrMiniHelp);
  setTextIfPresent("redactorOcrSectionTitle", redactor.ocrSectionTitle);
  setTextIfPresent("pasteRedactorImageButton", redactor.pasteImageButton);
  setTextIfPresent("redactorImageUploadLabelText", redactor.uploadImageButton);
  setTextIfPresent("clearRedactorImageButton", redactor.clearImageButton);
  setTextIfPresent("fetchRedactorImageTextButton", redactor.fetchSpecificButton);
  setTextIfPresent("fetchRedactorRawTextButton", redactor.fetchRawButton);
  setAttrIfPresent("redactorImageFrame", "aria-label", redactor.imageFrameAriaLabel);
  setAttrIfPresent("redactorImagePreview", "alt", redactor.imagePreviewAlt);
  setTextIfPresent("redactorImagePlaceholder", redactor.imagePlaceholder);

  setTextIfPresent("redactorGeneralTermsLabel", redactor.generalTermsLabel);
  setPlaceholderIfPresent("redactorGeneralTerms", redactor.generalTermsPlaceholder);
  setTextIfPresent("uploadGeneralTermsButton", redactor.importGeneralButton);
  setTextIfPresent("exportGeneralTermsButton", redactor.exportGeneralButton);
  setTextIfPresent("clearGeneralTermsButton", redactor.clearGeneralButton);

  setTextIfPresent("redactorSpecificTermsLabel", redactor.specificTermsLabel);
  setPlaceholderIfPresent("redactorTerms", redactor.specificTermsPlaceholder);
  setTextIfPresent("clearRedactorButton", redactor.clearSpecificButton);
  setTextIfPresent("redactButton", redactor.redactButton);

  setTextIfPresent("redactorOcrRawOutputLabel", redactor.rawOutputLabel);
  setPlaceholderIfPresent("redactorOcrRawOutput", redactor.rawOutputPlaceholder);
  setTextIfPresent("copyRedactorRawOutputButton", redactor.copyRawButton);
  setTextIfPresent("clearRedactorRawOutputButton", redactor.clearRawButton);

  setTextIfPresent("redactorBirthdateLabel", redactor.birthdateLabel);
  setPlaceholderIfPresent("redactorBirthdateInput", redactor.birthdatePlaceholder);
  setTextIfPresent("addBirthdateFormatsButton", redactor.addDatesButton);

  if (toggleButton) {
    toggleButton.textContent = isOpen ? redactor.toggleHide : redactor.toggleShow;
  }

  window.__redactorI18n = redactor;
}

function updateTranscribeUI(trans) {
  const pageTitle = document.getElementById("page-title-transcribe");
  if (pageTitle) pageTitle.textContent = trans.pageTitle;
  const usageEl = document.getElementById("openaiUsageLink");
  if (usageEl) usageEl.textContent = trans.openaiUsageLinkText;
  const walletEl = document.getElementById("openaiWalletLink");
  if (walletEl) walletEl.textContent = trans.openaiWalletLinkText;
  const guideButton = document.getElementById("btnGuide");
  if (guideButton) guideButton.textContent = trans.btnGuide;
  const newsBtn = document.getElementById("btnNews");
  if (newsBtn) {
    newsBtn.textContent = trans.btnNews ?? "Status & Updates";
  }
  const backButton = document.getElementById("backToHomeButton");
  if (backButton) backButton.textContent = trans.backToHome;
  document.getElementById("recordingAreaTitle").textContent = trans.recordingAreaTitle;
  const readFirstElem = document.getElementById("read-first-text");
  if (readFirstElem && trans.readFirstText) {
    readFirstElem.textContent = trans.readFirstText;
  }
  document.getElementById("recordTimer").textContent = trans.recordTimer;
  document.getElementById("transcribeTimer").textContent = trans.transcribeTimer;
  document.getElementById("transcription").placeholder = trans.transcriptionPlaceholder;

  const supplementaryInfoEl = document.getElementById("supplementaryInfo");
  if (supplementaryInfoEl) {
    supplementaryInfoEl.placeholder =
      trans.supplementaryInfoPlaceholder ?? "Supplementary information (optional)";
  }

  const promptExportBtnEl = document.getElementById("promptExportBtn");
  if (promptExportBtnEl) {
    promptExportBtnEl.textContent = trans.promptExportButton ?? "Export";
  }
  const promptImportBtnEl = document.getElementById("promptImportBtn");
  if (promptImportBtnEl) {
    promptImportBtnEl.textContent = trans.promptImportButton ?? "Import";
  }

  document.getElementById("startButton").textContent = trans.startButton;
  document.getElementById("stopButton").textContent = trans.stopButton;
  document.getElementById("pauseResumeButton").textContent = trans.pauseButton;
  document.getElementById("statusMessage").textContent = trans.statusMessage;
  document.getElementById("noteGenerationTitle").textContent = trans.noteGenerationTitle;
  document.getElementById("generateNoteButton").textContent = trans.generateNoteButton;
  document.getElementById("noteTimer").textContent = trans.noteTimer;
  document.getElementById("generatedNote").placeholder = trans.generatedNotePlaceholder;
  document.getElementById("customPromptTitle").textContent = trans.customPromptTitle;
  const promptSlotLabelEl = document.getElementById("promptSlotLabel");
  if (promptSlotLabelEl) {
    promptSlotLabelEl.textContent = trans.promptSlotLabel;
  }
  document.getElementById("customPrompt").placeholder = trans.customPromptPlaceholder;
  const guideHeading = document.getElementById("guideHeading");
  if (guideHeading) guideHeading.textContent = trans.guideHeading;
  const guideText = document.getElementById("guideText");
  if (guideText) guideText.innerHTML = trans.guideText;
  updateRedactorUI(trans);
  updateSecondaryNoteUI(trans);
  installTimerI18nGuards(trans);
}

function installTimerI18nGuards(trans) {
  const templates = {
    recordTimer: trans.recordTimer,
    transcribeTimer: trans.transcribeTimer,
    noteTimer: trans.noteTimer,
  };

  window.__timerI18nState = window.__timerI18nState || {};
  const state = window.__timerI18nState;
  if (!state.disposerRegistered) {
    state.disposerRegistered = true;
    registerWorkspaceDisposer(() => {
      (state.observers || []).forEach((observer) => {
        try { observer.disconnect(); } catch (_) {}
      });
      state.observers = [];
    }, { scope: "window" });
  }
  if (Array.isArray(state.observers)) {
    state.observers.forEach((o) => {
      try { o.disconnect(); } catch {}
    });
  }
  state.observers = [];

  Object.entries(templates).forEach(([id, template]) => {
    const el = document.getElementById(id);
    if (!el || typeof template !== "string") return;

    const tpl = parseTimerTemplate(template);
    normalizeTimerText(el, tpl);

    const obs = new MutationObserver(() => normalizeTimerText(el, tpl));
    obs.observe(el, { childList: true, characterData: true, subtree: true });
    state.observers.push(obs);
  });
}

function parseTimerTemplate(template) {
  const m = template.match(/^(.*?:\s*)0\s+(\S+)\s*$/);
  return {
    prefix: m ? m[1] : (template.replace(/\d.*$/, "") || ""),
    secUnit: m ? m[2] : "sec",
    minUnit: "min",
  };
}

function parseElapsedSecondsFromTimerText(text) {
  const timePart = (text.match(/:\s*(.*)$/)?.[1] || text || "").trim();
  if (!timePart) return null;

  const minMatch = timePart.match(/(\d+)\s*min\b/i);
  const secMatch = timePart.match(/(\d+)\s*(sec|sek)\b/i);

  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  const seconds = secMatch
    ? parseInt(secMatch[1], 10)
    : (() => {
        const n = timePart.match(/(\d+)/);
        return n ? parseInt(n[1], 10) : null;
      })();

  if (seconds == null && !minMatch) return null;
  return minutes * 60 + (seconds || 0);
}

function formatSecondsLocalized(totalSec, units) {
  if (totalSec < 60) return `${totalSec} ${units.secUnit}`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s > 0 ? `${m} ${units.minUnit} ${s} ${units.secUnit}` : `${m} ${units.minUnit}`;
}

function normalizeTimerText(el, tpl) {
  const current = (el.textContent || "").trim();
  const totalSec = parseElapsedSecondsFromTimerText(current);
  if (totalSec == null) return;

  const desired = `${tpl.prefix}${formatSecondsLocalized(totalSec, tpl)}`;
  if (current !== desired) el.textContent = desired;
}

export default { initIndexLanguage, initTranscribeLanguage };
