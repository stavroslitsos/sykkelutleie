// Extracted from transcribe.html inline editor/redactor utilities.
// Keeps page behavior unchanged while reducing page-owned runtime logic.

import { registerWorkspaceDisposer } from '../core/workspace-disposal.js';


  // 3) Log pageview after DOM is ready + log clicks with provider context
  document.addEventListener('DOMContentLoaded', () => {
    // Optional: keep pageview lean (no provider fields)
    // Capture the "fresh page load" textarea heights so Clear can restore them.
    const captureDefaultHeight = (el) => {
      if (!el) return;
      const cs = window.getComputedStyle(el);
      // Prefer CSS min-height (your baseline), fall back to rendered height.
      const baseline =
        (cs.minHeight && cs.minHeight !== '0px') ? cs.minHeight :
        `${el.getBoundingClientRect().height}px`;
      el.dataset.defaultHeight = baseline;
    };

    const resetTextareaToDefault = (el) => {
      if (!el) return;
      el.value = '';
      el.scrollTop = 0;
      const baseline = el.dataset.defaultHeight;
      if (baseline) el.style.height = baseline;
      else el.style.height = '';
    };

    const SUPPLEMENTARY_DATE_TOGGLE_KEY = 'supplementary_date_enabled';

    const getTodaySupplementaryDateLine = () => {
      const dateStr = new Intl.DateTimeFormat('nb-NO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date());
      return `Dagens dato er ${dateStr}`;
    };

    const isExactSupplementaryDateLine = (line) =>
      /^Dagens dato er \d{2}\.\d{2}\.\d{4}\s*$/i.test(String(line).trim());

    const normalizeSupplementaryDateLine = (text, { enabled } = {}) => {
      const normalized = String(text || '').replace(/\r\n/g, '\n');
      const lines = normalized.split('\n');
      const dateLine = getTodaySupplementaryDateLine();
      const bodyLines = lines.filter(
        (line) => !isExactSupplementaryDateLine(line)
      );
      const body = bodyLines.join('\n').replace(/^\n+/, '');

      if (!enabled) {
        return body;
      }

      // Keep one intentionally blank line between the sticky date and the
      // supplementary text. Preserve the same spacing even while the body is
      // empty so later typing or pasting starts below that blank line.
      return body ? `${dateLine}\n\n${body}` : `${dateLine}\n\n`;
    };

    const getSupplementaryDateToggleState = () => {
      const toggle = document.getElementById('supplementaryDateToggle');
      if (toggle && toggle.type === 'checkbox') {
        return !!toggle.checked;
      }
      try {
        return sessionStorage.getItem(SUPPLEMENTARY_DATE_TOGGLE_KEY) === '1';
      } catch (_) {
        return false;
      }
    };

    const syncSupplementaryStickyDate = ({ focus = false, resetView = false } = {}) => {
      if (!supplementaryInfoEl) return;
      const nextValue = normalizeSupplementaryDateLine(supplementaryInfoEl.value, {
        enabled: getSupplementaryDateToggleState(),
      });
      if (supplementaryInfoEl.value !== nextValue) {
        supplementaryInfoEl.value = nextValue;
        supplementaryInfoEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
      // Visual reset (scroll-to-top + height baseline) is only desired for
      // explicit user actions like initial setup or toggling the Date
      // checkbox — NOT on every blur. On blur, the user has just been
      // interacting with the textarea (resizing, scrolling, editing) and
      // resetting visual state would fight against what they just did.
      if (resetView) {
        supplementaryInfoEl.scrollTop = 0;
        const baseline = supplementaryInfoEl.dataset.defaultHeight;
        if (baseline) supplementaryInfoEl.style.height = baseline;
        else supplementaryInfoEl.style.height = '';
      }
      if (focus) supplementaryInfoEl.focus();
    };

    const resetSupplementaryTextareaSticky = ({ focus = false } = {}) => {
      if (!supplementaryInfoEl) return;
      delete supplementaryInfoEl.dataset.preserveHistoricalDate;
      resetTextareaToDefault(supplementaryInfoEl);
      if (getSupplementaryDateToggleState()) {
        supplementaryInfoEl.value = normalizeSupplementaryDateLine('', { enabled: true });
      }
      supplementaryInfoEl.dispatchEvent(new Event('input', { bubbles: true }));
      if (focus) supplementaryInfoEl.focus();
    };

    const bindSupplementaryStickyDateBlur = () => {
      if (!supplementaryInfoEl || supplementaryInfoEl.dataset.stickyDateBlurBound === '1') return;
      supplementaryInfoEl.dataset.stickyDateBlurBound = '1';

      supplementaryInfoEl.addEventListener('input', (event) => {
        if (event.isTrusted) delete supplementaryInfoEl.dataset.preserveHistoricalDate;
      });

      supplementaryInfoEl.addEventListener('blur', () => {
        if (!getSupplementaryDateToggleState()) return;
        if (supplementaryInfoEl.dataset.preserveHistoricalDate === '1') return;
        syncSupplementaryStickyDate({ focus: false });
      });
    };

    
    const transcriptionEl = document.getElementById('transcription');
    const supplementaryInfoEl = document.getElementById('supplementaryInfo');
    const generalTermsEl = document.getElementById('redactorGeneralTerms');
    const redactorTermsEl = document.getElementById('redactorTerms');
    const ocrRawOutputEl = document.getElementById('redactorOcrRawOutput');
    const birthdateInputEl = document.getElementById('redactorBirthdateInput');
    const supplementaryRedactorLayout = document.getElementById('supplementaryRedactorLayout');
    const redactorPane = document.getElementById('redactorPane');
    const toggleRedactorButton = document.getElementById('toggleRedactorButton');
    const applyRedactionButton = document.getElementById('applyRedactionButton');
    const clearRedactorButton = document.getElementById('clearRedactorButton');
    const clearGeneralTermsButton = document.getElementById('clearGeneralTermsButton');
    const uploadGeneralTermsButton = document.getElementById('uploadGeneralTermsButton');
    const generalTermsFileInput = document.getElementById('generalTermsFileInput');
    const exportGeneralTermsButton = document.getElementById('exportGeneralTermsButton');
    const redactorStatus = document.getElementById('redactorStatus');
    const pasteRedactorImageButton = document.getElementById('pasteRedactorImageButton');
    const redactorImageUpload = document.getElementById('redactorImageUpload');
    const clearRedactorImageButton = document.getElementById('clearRedactorImageButton');
    const fetchRedactorImageTextButton = document.getElementById('fetchRedactorImageTextButton');
    const fetchRedactorRawTextButton = document.getElementById('fetchRedactorRawTextButton');
    const redactorImageFrame = document.getElementById('redactorImageFrame');
    const redactorImagePreview = document.getElementById('redactorImagePreview');
    const redactorImagePlaceholder = document.getElementById('redactorImagePlaceholder');
    const addBirthdateFormatsButton = document.getElementById('addBirthdateFormatsButton');
    const copyRedactorRawOutputButton = document.getElementById('copyRedactorRawOutputButton');
    const clearRedactorRawOutputButton = document.getElementById('clearRedactorRawOutputButton');
    const downloadTranscriptButton = document.getElementById('downloadTranscriptButton');

    // Keep this control in the Redactor runtime so the update remains
    // self-contained in editor-tools.js. It is inserted immediately after
    // the Redact button and starts enabled on every page load.
    const redactorAutocopyUi = (() => {
      let toggle = document.getElementById('redactorAutocopyToggle');
      let labelText = document.getElementById('redactorAutocopyLabel');
      let container = toggle?.closest?.('label') || null;

      if (!toggle && applyRedactionButton) {
        container = document.createElement('label');
        container.className = 'redactor-autocopy-toggle';
        container.htmlFor = 'redactorAutocopyToggle';
        container.style.display = 'inline-flex';
        container.style.alignItems = 'center';
        container.style.gap = '5px';
        container.style.margin = '0';
        container.style.fontSize = '12px';
        container.style.color = '#444';
        container.style.whiteSpace = 'nowrap';
        container.style.cursor = 'pointer';

        toggle = document.createElement('input');
        toggle.id = 'redactorAutocopyToggle';
        toggle.type = 'checkbox';
        toggle.checked = true;
        toggle.style.margin = '0';
        toggle.style.accentColor = '#5a9';

        labelText = document.createElement('span');
        labelText.id = 'redactorAutocopyLabel';
        labelText.textContent = 'Autocopy';

        container.append(toggle, labelText);
        applyRedactionButton.insertAdjacentElement('afterend', container);
      }

      return { toggle, labelText, container };
    })();
    const redactorAutocopyToggle = redactorAutocopyUi.toggle;
    const redactorAutocopyLabelEl = redactorAutocopyUi.labelText;
    const redactorAutocopyContainer = redactorAutocopyUi.container;

    const REDACTOR_STRINGS = {
      en: {
        showRedactor: 'Show redactor',
        hideRedactor: 'Hide redactor',
        title: 'Redactor',
        help: 'Add one term per line. General and specific terms are both used when you click Redact. General terms stay while this tab remains open, but clear when the tab is closed. Generic address words in General are only redacted in address context.',
        ocrSectionTitle: 'Screenshot → OCR',
        ocrMiniHelpHtml: 'Use Windows + Shift + S, then click <strong>Paste image</strong>. You can also press <strong>Ctrl + V</strong> while the image frame is focused, or upload an image file.',
        pasteImage: 'Paste image',
        uploadImage: 'Upload image',
        clearImage: 'Clear image',
        fetchOcrSpecific: 'Fetch OCR → Specific',
        fetchOcrRaw: 'Fetch OCR → Raw text',
        fetching: 'Fetching…',
        imageFrameAriaLabel: 'OCR image preview. Paste an image here with Ctrl plus V.',
        imagePreviewAlt: 'OCR screenshot preview',
        imagePlaceholder: 'No image loaded yet. Paste a screenshot here or upload an image.',
        generalTermsLabel: 'General terms',
        generalTermsPlaceholder: 'General terms (one per line)\ne.g. hospital\nName',
        importGeneral: 'Import General.txt',
        exportGeneral: 'Export General.txt',
        clearGeneral: 'Clear general',
        specificTermsLabel: 'Specific terms',
        specificTermsPlaceholder: 'Specific terms (one per line)\nOla Nordmann\n12345678',
        clearSpecific: 'Clear specific',
        redact: 'Redact',
        autocopy: 'Autocopy',
        autocopyTitle: 'Automatically copy the redacted transcript to the clipboard',
        rawOutputLabel: 'OCR raw text',
        rawOutputPlaceholder: 'Raw OCR text appears here without formatting or cleanup. Useful when you just want to copy the transcription.',
        copyRaw: 'Copy raw',
        clearRaw: 'Clear raw',
        birthdateLabel: 'Birthdate helper',
        birthdatePlaceholder: 'DDMMYY, DDMMYYYY, YYYY-MM-DD or national ID number',
        addDates: 'Add dates',
        messages: {
          specificTermsNormalized: 'Specific terms cleaned and normalized.',
          imagePastedReady: 'Image pasted and ready for OCR.',
          noImageForOcr: 'No image to OCR. Paste or upload one first.',
          tesseractLoadFailed: 'Tesseract.js failed to load in this browser tab.',
          ocrRunning: ({ progress }) => `OCR running… ${progress}%`,
          ocrLoadingLanguageData: 'OCR is loading language data…',
          ocrStarting: 'OCR is starting…',
          noTextDetected: 'No text was detected in the image.',
          rawOcrComplete: ({ usedLanguage }) => `Raw OCR complete (${usedLanguage}) → text placed in Raw text.`,
          ocrError: ({ errorMessage }) => `OCR error: ${errorMessage}`,
          noSpecificTermsProduced: 'OCR finished, but no usable Specific terms were produced.',
          noNewUniqueTerms: ({ usedLanguage }) => `OCR finished (${usedLanguage}), but no new unique terms were added.`,
          ocrCompleteAddedSpecific: ({ usedLanguage, addedCount }) => `OCR complete (${usedLanguage}) → added ${addedCount} term${addedCount === 1 ? '' : 's'} to Specific.`,
          ocrCompleteAddedSpecificBirthdate: ({ usedLanguage, addedCount, detectedBirthdate }) => `OCR complete (${usedLanguage}) → added ${addedCount} term${addedCount === 1 ? '' : 's'} to Specific. Birthdate field auto-filled with ${detectedBirthdate}.`,
          redactedTerms: ({ termCount }) => `Redacted ${termCount} term${termCount === 1 ? '' : 's'} in Transcript and Supplementary information.`,
          redactionComplete: 'Built-in identifiers were redacted in Transcript and Supplementary information.',
          noMatchingText: 'No matching text was found in Transcript or Supplementary information.',
          redactedTranscriptCopyFailed: 'Redaction completed, but the transcript could not be copied to the clipboard.',
          clipboardReadImageFailed: ({ errorMessage }) => errorMessage || 'Could not read an image from the clipboard.',
          generalTermsCleared: 'General terms cleared.',
          specificTermsCleared: 'Specific terms and birthdate cleared.',
          loadedGeneralFile: ({ fileName }) => `Loaded ${fileName} into General terms.`,
          couldNotReadFile: ({ fileName, errorMessage }) => `Could not read ${fileName}: ${errorMessage}`,
          savedGeneralSelectedLocation: 'Saved General.txt to the selected location.',
          savedGeneralDownloadFlow: 'Saved General.txt with the browser download flow.',
          saveCanceled: 'Save canceled.',
          couldNotExportGeneral: ({ errorMessage }) => `Could not export General.txt: ${errorMessage}`,
          addAtLeastOneTerm: 'Add at least one General or Specific term to redact.',
          invalidBirthdate: 'Enter a valid birthdate as DDMMYY, DDMMYYYY, YYYY-MM-DD, or an 11-digit Norwegian identity number.',
          birthdateAlreadyPresent: 'Those birthdate formats are already in Specific terms.',
          addedBirthdateFormats: ({ addedCount }) => `Added ${addedCount} birthdate format${addedCount === 1 ? '' : 's'} to Specific.`,
          clipboardNoImage: 'No image was found in the clipboard. Use Windows + Shift + S first, then try again.',
          loadedImage: ({ fileName }) => `Loaded image: ${fileName}`,
          imageCleared: 'Image cleared.',
          rawTextEmpty: 'Raw text is empty.',
          rawTextCopied: 'Raw text copied to clipboard.',
          rawTextCopyFailed: 'Could not copy raw text in this browser tab.',
          rawTextCleared: 'Raw text cleared.',
          pasteFromClipboardHint: 'Paste from clipboard with Ctrl + V, or use the Paste image button.',
        },
      },
      no: {
        showRedactor: 'Vis redactor',
        hideRedactor: 'Skjul redactor',
        title: 'Redactor',
        help: 'Legg til ett begrep per linje. Både generelle og spesifikke begreper brukes når du klikker Sladd. Generelle begreper beholdes så lenge denne fanen er åpen, men tømmes når fanen lukkes. Generiske adresseord i Generelle begreper sladdes bare i adressekontekst.',
        ocrSectionTitle: 'Skjermbilde → OCR',
        ocrMiniHelpHtml: 'Bruk Windows + Shift + S, og klikk deretter <strong>Lim inn bilde</strong>. Du kan også trykke <strong>Ctrl + V</strong> mens bildefeltet er fokusert, eller laste opp en bildefil.',
        pasteImage: 'Lim inn bilde',
        uploadImage: 'Last opp bilde',
        clearImage: 'Tøm bilde',
        fetchOcrSpecific: 'Hent OCR → Spesifikke',
        fetchOcrRaw: 'Hent OCR → Råtekst',
        fetching: 'Henter…',
        imageFrameAriaLabel: 'Forhåndsvisning av OCR-bilde. Lim inn et bilde her med Ctrl pluss V.',
        imagePreviewAlt: 'Forhåndsvisning av OCR-skjermbilde',
        imagePlaceholder: 'Intet bilde lastet inn ennå. Lim inn et skjermbilde her eller last opp et bilde.',
        generalTermsLabel: 'Generelle begreper',
        generalTermsPlaceholder: 'Generelle begreper (ett per linje)\nf.eks. sykehus\nNavn',
        importGeneral: 'Importer General.txt',
        exportGeneral: 'Eksporter General.txt',
        clearGeneral: 'Tøm generelle',
        specificTermsLabel: 'Spesifikke begreper',
        specificTermsPlaceholder: 'Spesifikke begreper (ett per linje)\nOla Nordmann\n12345678',
        clearSpecific: 'Tøm spesifikke',
        redact: 'Sladd',
        autocopy: 'Autocopy',
        autocopyTitle: 'Kopier den ferdig sladdede transkripsjonen automatisk til utklippstavlen',
        rawOutputLabel: 'OCR-råtekst',
        rawOutputPlaceholder: 'Rå OCR-tekst vises her uten formatering eller opprydding. Nyttig når du bare vil kopiere transkripsjonen.',
        copyRaw: 'Kopier råtekst',
        clearRaw: 'Tøm råtekst',
        birthdateLabel: 'Fødselsdatohjelper',
        birthdatePlaceholder: 'DDMMÅÅ, DDMMÅÅÅÅ, ÅÅÅÅ-MM-DD eller identitetsnummer',
        addDates: 'Legg til datoer',
        messages: {
          specificTermsNormalized: 'Spesifikke begreper ble renset og normalisert.',
          imagePastedReady: 'Bildet er limt inn og klart for OCR.',
          noImageForOcr: 'Ingen bilde å kjøre OCR på. Lim inn eller last opp et bilde først.',
          tesseractLoadFailed: 'Tesseract.js kunne ikke lastes i denne nettleserfanen.',
          ocrRunning: ({ progress }) => `OCR kjører… ${progress}%`,
          ocrLoadingLanguageData: 'OCR laster språkdata…',
          ocrStarting: 'OCR starter…',
          noTextDetected: 'Ingen tekst ble oppdaget i bildet.',
          rawOcrComplete: ({ usedLanguage }) => `Rå-OCR fullført (${usedLanguage}) → tekst lagt inn i råtekst.`,
          ocrError: ({ errorMessage }) => `OCR-feil: ${errorMessage}`,
          noSpecificTermsProduced: 'OCR ble fullført, men ga ingen brukbare spesifikke begreper.',
          noNewUniqueTerms: ({ usedLanguage }) => `OCR ble fullført (${usedLanguage}), men ingen nye unike begreper ble lagt til.`,
          ocrCompleteAddedSpecific: ({ usedLanguage, addedCount }) => `OCR fullført (${usedLanguage}) → la til ${addedCount} begrep${addedCount === 1 ? '' : 'er'} i Spesifikke begreper.`,
          ocrCompleteAddedSpecificBirthdate: ({ usedLanguage, addedCount, detectedBirthdate }) => `OCR fullført (${usedLanguage}) → la til ${addedCount} begrep${addedCount === 1 ? '' : 'er'} i Spesifikke begreper. Fødselsdatofeltet ble fylt ut automatisk med ${detectedBirthdate}.`,
          redactedTerms: ({ termCount }) => `Sladdet ${termCount} begrep${termCount === 1 ? '' : 'er'} i Transkripsjon og Tilleggsinformasjon.`,
          redactionComplete: 'Innebygde identifikatorer ble sladdet i Transkripsjon og Tilleggsinformasjon.',
          noMatchingText: 'Fant ingen treff i Transkripsjon eller Tilleggsinformasjon.',
          redactedTranscriptCopyFailed: 'Sladdingen ble fullført, men transkripsjonen kunne ikke kopieres til utklippstavlen.',
          clipboardReadImageFailed: ({ errorMessage }) => errorMessage || 'Kunne ikke lese et bilde fra utklippstavlen.',
          generalTermsCleared: 'Generelle begreper tømt.',
          specificTermsCleared: 'Spesifikke begreper og fødselsdato tømt.',
          loadedGeneralFile: ({ fileName }) => `${fileName} ble lastet inn i Generelle begreper.`,
          couldNotReadFile: ({ fileName, errorMessage }) => `Kunne ikke lese ${fileName}: ${errorMessage}`,
          savedGeneralSelectedLocation: 'General.txt ble lagret på valgt plassering.',
          savedGeneralDownloadFlow: 'General.txt ble lagret via nettleserens nedlastingsflyt.',
          saveCanceled: 'Lagring avbrutt.',
          couldNotExportGeneral: ({ errorMessage }) => `Kunne ikke eksportere General.txt: ${errorMessage}`,
          addAtLeastOneTerm: 'Legg til minst ett generelt eller spesifikt begrep som skal sladdes.',
          invalidBirthdate: 'Skriv inn en gyldig fødselsdato som DDMMÅÅ, DDMMÅÅÅÅ, ÅÅÅÅ-MM-DD eller et 11-sifret norsk identitetsnummer.',
          birthdateAlreadyPresent: 'Disse fødselsdatoformatene finnes allerede i Spesifikke begreper.',
          addedBirthdateFormats: ({ addedCount }) => `La til ${addedCount} fødselsdatoformat${addedCount === 1 ? '' : 'er'} i Spesifikke begreper.`,
          clipboardNoImage: 'Fant ikke noe bilde i utklippstavlen. Bruk Windows + Shift + S først, og prøv igjen.',
          loadedImage: ({ fileName }) => `Bilde lastet inn: ${fileName}`,
          imageCleared: 'Bildet ble tømt.',
          rawTextEmpty: 'Råtekstfeltet er tomt.',
          rawTextCopied: 'Råtekst kopiert til utklippstavlen.',
          rawTextCopyFailed: 'Kunne ikke kopiere råtekst i denne nettleserfanen.',
          rawTextCleared: 'Råtekst tømt.',
          pasteFromClipboardHint: 'Lim inn fra utklippstavlen med Ctrl + V, eller bruk knappen Lim inn bilde.',
        },
      },
    };

    const getRedactorLanguage = () => {
      const langSelect = document.getElementById('lang-select-transcribe');
      const lang = (langSelect && langSelect.value) || localStorage.getItem('siteLanguage') || 'en';
      return lang === 'no' ? 'no' : 'en';
    };

    const getRedactorStrings = () => REDACTOR_STRINGS[getRedactorLanguage()] || REDACTOR_STRINGS.en;

    const getRedactorMessage = (key, params = {}) => {
      const message = getRedactorStrings().messages?.[key];
      if (typeof message === 'function') return message(params);
      return message || '';
    };

    const applyRedactorTranslations = () => {
      const strings = getRedactorStrings();
      const isOpen = Boolean(!redactorPane?.hidden);

      if (toggleRedactorButton) {
        toggleRedactorButton.textContent = isOpen ? strings.hideRedactor : strings.showRedactor;
      }
      if (document.getElementById('redactorTitle')) {
        document.getElementById('redactorTitle').textContent = strings.title;
      }
      if (document.getElementById('redactorHelp')) {
        document.getElementById('redactorHelp').textContent = strings.help;
      }
      if (document.getElementById('redactorOcrSectionTitle')) {
        document.getElementById('redactorOcrSectionTitle').textContent = strings.ocrSectionTitle;
      }
      if (document.getElementById('redactorOcrMiniHelp')) {
        document.getElementById('redactorOcrMiniHelp').innerHTML = strings.ocrMiniHelpHtml;
      }
      if (pasteRedactorImageButton) {
        pasteRedactorImageButton.textContent = strings.pasteImage;
      }
      if (document.getElementById('redactorImageUploadLabelText')) {
        document.getElementById('redactorImageUploadLabelText').textContent = strings.uploadImage;
      }
      if (clearRedactorImageButton) {
        clearRedactorImageButton.textContent = strings.clearImage;
      }
      if (fetchRedactorImageTextButton && !fetchRedactorImageTextButton.disabled) {
        fetchRedactorImageTextButton.textContent = strings.fetchOcrSpecific;
      }
      if (fetchRedactorRawTextButton && !fetchRedactorRawTextButton.disabled) {
        fetchRedactorRawTextButton.textContent = strings.fetchOcrRaw;
      }
      if (redactorImageFrame) {
        redactorImageFrame.setAttribute('aria-label', strings.imageFrameAriaLabel);
      }
      if (redactorImagePreview) {
        redactorImagePreview.alt = strings.imagePreviewAlt;
      }
      if (redactorImagePlaceholder) {
        redactorImagePlaceholder.textContent = strings.imagePlaceholder;
      }
      if (document.getElementById('redactorGeneralTermsLabel')) {
        document.getElementById('redactorGeneralTermsLabel').textContent = strings.generalTermsLabel;
      }
      if (generalTermsEl) {
        generalTermsEl.placeholder = strings.generalTermsPlaceholder;
      }
      if (uploadGeneralTermsButton) {
        uploadGeneralTermsButton.textContent = strings.importGeneral;
      }
      if (exportGeneralTermsButton) {
        exportGeneralTermsButton.textContent = strings.exportGeneral;
      }
      if (clearGeneralTermsButton) {
        clearGeneralTermsButton.textContent = strings.clearGeneral;
      }
      if (document.getElementById('redactorSpecificTermsLabel')) {
        document.getElementById('redactorSpecificTermsLabel').textContent = strings.specificTermsLabel;
      }
      if (redactorTermsEl) {
        redactorTermsEl.placeholder = strings.specificTermsPlaceholder;
      }
      if (clearRedactorButton) {
        clearRedactorButton.textContent = strings.clearSpecific;
      }
      if (applyRedactionButton) {
        applyRedactionButton.textContent = strings.redact;
      }
      if (redactorAutocopyLabelEl) {
        redactorAutocopyLabelEl.textContent = strings.autocopy;
      }
      if (redactorAutocopyToggle) {
        redactorAutocopyToggle.setAttribute('aria-label', strings.autocopyTitle);
      }
      if (redactorAutocopyContainer) {
        redactorAutocopyContainer.title = strings.autocopyTitle;
      }
      if (document.getElementById('redactorOcrRawOutputLabel')) {
        document.getElementById('redactorOcrRawOutputLabel').textContent = strings.rawOutputLabel;
      }
      if (ocrRawOutputEl) {
        ocrRawOutputEl.placeholder = strings.rawOutputPlaceholder;
      }
      if (copyRedactorRawOutputButton) {
        copyRedactorRawOutputButton.textContent = strings.copyRaw;
      }
      if (clearRedactorRawOutputButton) {
        clearRedactorRawOutputButton.textContent = strings.clearRaw;
      }
      if (document.getElementById('redactorBirthdateLabel')) {
        document.getElementById('redactorBirthdateLabel').textContent = strings.birthdateLabel;
      }
      if (birthdateInputEl) {
        birthdateInputEl.placeholder = strings.birthdatePlaceholder;
      }
      if (addBirthdateFormatsButton) {
        addBirthdateFormatsButton.textContent = strings.addDates;
      }

      if (typeof refreshRedactorStatusText === 'function') {
        refreshRedactorStatusText();
      }
    };

    const redactorLangSelect = document.getElementById('lang-select-transcribe');
    if (redactorLangSelect) {
      redactorLangSelect.addEventListener('change', () => {
        requestAnimationFrame(() => {
          applyRedactorTranslations();
        });
      });
    }


    captureDefaultHeight(transcriptionEl);
    captureDefaultHeight(supplementaryInfoEl);
    captureDefaultHeight(generalTermsEl);
    captureDefaultHeight(redactorTermsEl);
    captureDefaultHeight(ocrRawOutputEl);

    const REDACTOR_VISIBILITY_KEY = 'redactor_visible';
    const REDACTOR_SESSION_KEYS = {
      general: 'redactor_general_terms_session',
      specific: 'redactor_specific_terms_session',
      rawOutput: 'redactor_ocr_raw_output_session',
      birthdate: 'redactor_birthdate_session',
    };

    let currentOcrImageBlob = null;
    let currentOcrImageObjectUrl = '';
    let cleanSpecificTimer = null;
    let editorGeneration = 0;
    const ocrWorkers = new Set();

    const normalizeNewlines = (value) => (value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const readSessionValue = (key, fallback = '') => {
      try {
        const value = sessionStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (_) {
        return fallback;
      }
    };

    const writeSessionValue = (key, value) => {
      try {
        sessionStorage.setItem(key, value);
      } catch (_) {}
    };

    const setRedactorStatus = (message, isError = false, { statusKey = '', statusParams = null } = {}) => {
      if (!redactorStatus) return;
      redactorStatus.textContent = message || '';
      redactorStatus.classList.toggle('is-error', Boolean(isError));

      if (statusKey) {
        redactorStatus.dataset.statusKey = statusKey;
        redactorStatus.dataset.statusParams = JSON.stringify(statusParams || {});
      } else {
        delete redactorStatus.dataset.statusKey;
        delete redactorStatus.dataset.statusParams;
      }
    };

    const setRedactorStatusByKey = (statusKey, statusParams = {}, isError = false) => {
      setRedactorStatus(getRedactorMessage(statusKey, statusParams), isError, { statusKey, statusParams });
    };

    const refreshRedactorStatusText = () => {
      if (!redactorStatus?.dataset?.statusKey) return;

      let statusParams = {};
      try {
        statusParams = JSON.parse(redactorStatus.dataset.statusParams || '{}');
      } catch (_) {
        statusParams = {};
      }

      setRedactorStatus(
        getRedactorMessage(redactorStatus.dataset.statusKey, statusParams),
        redactorStatus.classList.contains('is-error'),
        {
          statusKey: redactorStatus.dataset.statusKey,
          statusParams,
        }
      );
    };

    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const getLines = (value) => normalizeNewlines(value)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const collapseInternalSpacesInNumericToken = (tok) => /^(?:\d+\s+)+\d+$/.test(tok)
      ? tok.replace(/\s+/g, '')
      : tok;

    // Accept names from every Unicode alphabet, including decomposed accent
    // marks, apostrophes and typographic hyphens. The previous ASCII/Norwegian
    // character class caused one accented token to keep an entire pasted name
    // on a single line instead of splitting it like other names.
    const isNameLikeToken = (tok) => /^(?=.*\p{L})[\p{L}\p{M}\p{Pd}'’ʼ]+$/u.test(tok);

    const collapseInternalSpacesInAlphaToken = (tok) => /^(?:[\p{L}\p{M}\p{Pd}'’ʼ]+\s+)+[\p{L}\p{M}\p{Pd}'’ʼ]+$/u.test(tok)
      ? tok.replace(/\s+/g, '')
      : tok;

    const stripEdgePunct = (tok) => tok.replace(/^[()\[\]{}.,;:]+|[()\[\]{}.,;:]+$/g, '');

    const splitFnrToken = (tok) => /^\d{11}$/.test(tok)
      ? [tok.slice(0, 6), tok.slice(6)]
      : [tok];

    const isWordOnlyRedactionTerm = (term) => /^[\p{L}]+(?:[ -][\p{L}]+)*$/u.test((term || '').trim());

    const normalizeSpecificKey = (s) => (s || '')
      .normalize('NFKC')
      .replace(/\u00A0/g, ' ')
      .replace(/\u00AD/g, '')
      .replace(/[\u200B\u200C\u200D\u2060]/g, '')
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\u2043\uFE58\uFE63\uFF0D]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase();

    const dedupeSpecificLines = (text) => {
      const seen = new Set();
      const out = [];
      for (const raw of normalizeNewlines(text).split('\n')) {
        const line = raw.trim();
        if (!line) continue;
        const key = normalizeSpecificKey(line);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(line);
      }
      return out.join('\n');
    };

    const ensurePhoneVariants = (text) => {
      const lines = normalizeNewlines(text).split('\n');
      const seen = new Set();
      const out = [];

      const addLine = (value) => {
        const line = (value || '').trim();
        if (!line) return;
        const key = line.toLocaleLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push(line);
      };

      for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        addLine(line);

        const digits = (line.match(/\d/g) || []).join('');
        if (/^\d{8}$/.test(line)) {
          addLine(line.replace(/(\d{2})(?=\d)/g, '$1 ').trim());
          addLine(`+47${line}`);
          continue;
        }

        if (/^\+47\d{8}$/.test(line)) {
          const local = line.slice(3);
          addLine(local);
          addLine(local.replace(/(\d{2})(?=\d)/g, '$1 ').trim());
          continue;
        }

        if (digits.length === 10 && digits.startsWith('47')) {
          const local = digits.slice(-8);
          addLine(local);
          addLine(local.replace(/(\d{2})(?=\d)/g, '$1 ').trim());
          addLine(`+47${local}`);
        }
      }

      return out.join('\n');
    };

    const postprocessSpecificTerms = (block) => {
      const lines = getLines(block);
      const out = [];
      let i = 0;

      while (i < lines.length) {
        const s = lines[i];

        // Discard OCR/paste noise that consists of only one standalone
        // letter or digit. Existing cleanup rules below (including the
        // two-digit numeric-line filter) continue to apply unchanged.
        if (/^(?:\p{L}|\d)$/u.test(s)) {
          i += 1;
          continue;
        }

        if (/^\d{1,3}\s*(?:år|ar)$/i.test(s)) {
          i += 1;
          continue;
        }

        if (/^(?:år|ar|moss|familie|Vei|Forelder|bostdsadresse|kvinne|mann|telefon|Telefonnummer|Moss|Bam|Barn|foreldre|ektefelle|tlf|ikke|funnet|nærmeste|pårørende)$/iu.test(s)) {
          if (/^(?:år|ar)$/i.test(s) && out.length && /^\d{1,3}$/.test(out[out.length - 1])) {
            out.pop();
          }
          i += 1;
          continue;
        }

        if (/^\d{2}$/.test(s)) {
          i += 1;
          continue;
        }

        let m = s.match(/^(?:tlf|tif|ti|Telefonnummer|telefon|mobil)\s*[.:\-]?\s*(?:\+?\s*47)?\s*([0-9][0-9\s\-]{7,})$/i);
        if (m) {
          const digits = (m[1].match(/\d/g) || []).join('');
          if (digits.length >= 8) {
            const local = digits.slice(-8);
            out.push(local);
            out.push(`+47${local}`);
            i += 1;
            continue;
          }
        }

        if (/^(?:tlf|tif|ti|telefon|mobil)\.?:?$/i.test(s) && i + 1 < lines.length) {
          const nxt = lines[i + 1];
          const digits = (nxt.match(/\d/g) || []).join('');
          if (digits.startsWith('47') && digits.length >= 10) {
            const local = digits.slice(-8);
            out.push(local);
            out.push(`+47${local}`);
            i += 2;
            continue;
          }
          if (digits.length === 8) {
            out.push(digits);
            out.push(`+47${digits}`);
            i += 2;
            continue;
          }
        }

        out.push(s);
        i += 1;
      }

      return out.join('\n');
    };

    const cleanSpecificBlock = (text) => {
      let cleaned = postprocessSpecificTerms(text || '');
      cleaned = ensurePhoneVariants(cleaned);
      cleaned = dedupeSpecificLines(cleaned);
      return cleaned;
    };

    const extractBirthdateFromFnrText = (text) => {
      const s = normalizeNewlines(text || '');

      let m = s.match(/(?:^|[^\d])(\d{6})\s*(?:\n|\s)?\s*(\d{5})(?!\d)/);
      if (m) return m[1];

      m = s.match(/(?:^|[^\d])(\d{11})(?!\d)/);
      if (m) return m[1].slice(0, 6);

      return '';
    };

    const ocrPostprocess = (input, {
      convertAt = false,
      dropCommasStack = true,
      splitTokensNewlines = true,
      splitFnr65 = true,
      merge323Numbers = true,
    } = {}) => {
      let s = normalizeNewlines(input);

      if (convertAt) {
        s = s.replace(/([A-Za-zÆØÅæøå0-9])@(?=[A-Za-zÆØÅæøå0-9])/g, '$1ø');
      }

      if (dropCommasStack) {
        s = s.replace(/,/g, '\n');
        s = s.replace(/[;|•]+/g, '\n');
      }

      if (merge323Numbers) {
        s = s.replace(/\b(\d{3})\s+(\d{2})\s+(\d{3})\b/g, '$1$2$3');
      }

      s = s.replace(/[ \t]+\n/g, '\n');
      s = s.replace(/\n[ \t]+/g, '\n');

      if (splitFnr65) {
        s = s.replace(/(^|[^\d])(\d{6})\s+(\d{5})(?!\d)/g, (_, lead, first, second) => `${lead}${first}\n${second}`);
      }

      s = s.replace(/\((\d+)\)/g, '\n$1\n');

      const linesOut = [];

      for (const rawLine of s.split('\n')) {
        let line = rawLine.trim();
        if (!line) continue;

        if (splitTokensNewlines) {
          let tokens = line.split(/\s+/)
            .map((token) => stripEdgePunct(token))
            .map((token) => collapseInternalSpacesInNumericToken(token))
            .map((token) => collapseInternalSpacesInAlphaToken(token))
            .filter(Boolean);

          if (splitFnr65) {
            tokens = tokens.flatMap((token) => splitFnrToken(token));
          }

          if (!tokens.length) continue;

          if (tokens.every((token) => isNameLikeToken(token) || /^\d+$/.test(token))) {
            for (const token of tokens) {
              linesOut.push(token);
            }
            continue;
          }

          line = tokens.join(' ').trim();
        }

        if (!line) continue;
        if (splitFnr65 && /^\d{11}$/.test(line)) {
          const parts = splitFnrToken(line);
          for (const part of parts) {
            linesOut.push(part);
          }
          continue;
        }
        linesOut.push(line);
      }

      return linesOut
        .filter((line, index, arr) => arr.indexOf(line) === index)
        .join('\n')
        .replace(/\n{2,}/g, '\n')
        .trim();
    };

    // Keep every source that enters the Specific terms field on the same
    // normalization path. OCR already uses these token-splitting options;
    // manual paste must do the same before the shared filtering, phone
    // variants, and deduplication steps run.
    const normalizeIncomingSpecificText = (text) => cleanSpecificBlock(
      ocrPostprocess(text || '', {
        convertAt: false,
        dropCommasStack: true,
        splitTokensNewlines: true,
        splitFnr65: true,
        merge323Numbers: true,
      })
    );

    const persistRedactorTextState = () => {
      if (generalTermsEl) writeSessionValue(REDACTOR_SESSION_KEYS.general, normalizeNewlines(generalTermsEl.value));
      if (redactorTermsEl) writeSessionValue(REDACTOR_SESSION_KEYS.specific, normalizeNewlines(redactorTermsEl.value));
      if (ocrRawOutputEl) writeSessionValue(REDACTOR_SESSION_KEYS.rawOutput, normalizeNewlines(ocrRawOutputEl.value));
      if (birthdateInputEl) writeSessionValue(REDACTOR_SESSION_KEYS.birthdate, birthdateInputEl.value || '');
    };

    const clearSessionValue = (key) => {
      try {
        sessionStorage.removeItem(key);
      } catch (_) {}
    };

    if (generalTermsEl) generalTermsEl.value = readSessionValue(REDACTOR_SESSION_KEYS.general, generalTermsEl.value || '');
    if (redactorTermsEl) {
      redactorTermsEl.value = '';
      clearSessionValue(REDACTOR_SESSION_KEYS.specific);
    }
    if (ocrRawOutputEl) {
      ocrRawOutputEl.value = '';
      clearSessionValue(REDACTOR_SESSION_KEYS.rawOutput);
    }
    if (birthdateInputEl) {
      birthdateInputEl.value = '';
      // Older markup limited the helper to six/eight digits. The expanded
      // parser also accepts ISO dates and complete Norwegian identity numbers.
      birthdateInputEl.removeAttribute('maxlength');
      clearSessionValue(REDACTOR_SESSION_KEYS.birthdate);
    }

    [generalTermsEl, redactorTermsEl, ocrRawOutputEl, birthdateInputEl].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', persistRedactorTextState);
    });

    if (redactorTermsEl) {
      redactorTermsEl.addEventListener('blur', () => {
        const cleaned = cleanSpecificBlock(redactorTermsEl.value || '');
        if (cleaned !== (redactorTermsEl.value || '')) {
          redactorTermsEl.value = cleaned;
          persistRedactorTextState();
          setRedactorStatusByKey('specificTermsNormalized');
        }
      });

      redactorTermsEl.addEventListener('paste', (event) => {
        clearTimeout(cleanSpecificTimer);

        const pastedText = event.clipboardData?.getData('text/plain');
        if (typeof pastedText === 'string') {
          event.preventDefault();

          const normalizedPaste = normalizeIncomingSpecificText(pastedText);
          if (!normalizedPaste) return;
          const detectedBirthdate = extractBirthdateFromFnrText(pastedText);

          const currentValue = redactorTermsEl.value || '';
          const selectionStart = Number.isInteger(redactorTermsEl.selectionStart)
            ? redactorTermsEl.selectionStart
            : currentValue.length;
          const selectionEnd = Number.isInteger(redactorTermsEl.selectionEnd)
            ? redactorTermsEl.selectionEnd
            : selectionStart;
          const textBeforeSelection = currentValue.slice(0, selectionStart);
          const textAfterSelection = currentValue.slice(selectionEnd);
          const leadingSeparator = textBeforeSelection && !textBeforeSelection.endsWith('\n')
            ? '\n'
            : '';
          const trailingSeparator = textAfterSelection && !textAfterSelection.startsWith('\n')
            ? '\n'
            : '';

          redactorTermsEl.setRangeText(
            `${leadingSeparator}${normalizedPaste}${trailingSeparator}`,
            selectionStart,
            selectionEnd,
            'end'
          );

          const cleaned = cleanSpecificBlock(redactorTermsEl.value || '');
          if (cleaned !== (redactorTermsEl.value || '')) {
            redactorTermsEl.value = cleaned;
          }
          if (detectedBirthdate && birthdateInputEl) {
            birthdateInputEl.value = detectedBirthdate;
          }
          persistRedactorTextState();
          return;
        }

        // Fallback for browsers that do not expose clipboardData on the paste
        // event: let the native paste finish, then normalize the full field.
        cleanSpecificTimer = setTimeout(() => {
          const currentValue = redactorTermsEl.value || '';
          const detectedBirthdate = extractBirthdateFromFnrText(currentValue);
          const cleaned = normalizeIncomingSpecificText(currentValue);
          let changed = false;
          if (cleaned !== (redactorTermsEl.value || '')) {
            redactorTermsEl.value = cleaned;
            changed = true;
          }
          if (detectedBirthdate && birthdateInputEl && birthdateInputEl.value !== detectedBirthdate) {
            birthdateInputEl.value = detectedBirthdate;
            changed = true;
          }
          if (changed) {
            persistRedactorTextState();
          }
        }, 50);
      });
    }

    const appendUniqueLines = (textarea, text) => {
      if (!textarea) return 0;
      const currentLines = getLines(textarea.value);
      const currentSet = new Set(currentLines.map((line) => line.toLocaleLowerCase()));
      const additions = getLines(text).filter((line) => {
        const key = line.toLocaleLowerCase();
        if (currentSet.has(key)) return false;
        currentSet.add(key);
        return true;
      });

      if (!additions.length) return 0;

      textarea.value = currentLines.length
        ? `${currentLines.join('\n')}\n${additions.join('\n')}`
        : additions.join('\n');

      persistRedactorTextState();
      return additions.length;
    };

    // Built-in rule: a Norwegian fødselsnummer is always redacted,
    // even if the user has not listed it explicitly. Two accepted
    // formats:
    //   - 11 digits, no separator:        12345678901
    //   - 6 digits + ONE space + 5:       123456 78901
    // The match must be bounded by non-word characters on both sides
    // ((?<![\w]) / (?![\w]) — \w is [A-Za-z0-9_] in JS), so:
    //   - 12+ contiguous digits do not match (no digit boundary)
    //   - letters glued to either end do not match (no letter boundary)
    //   - other separators (tab, double-space, dot) do not match the
    //     spaced form — only a single literal space.
    const ELEVEN_DIGIT_PATTERN = /(?<![\w])(?:\d{6} \d{5}|\d{11})(?![\w])/g;

    // Built-in numeric ID rules:
    //   - redact every contiguous run of at least five digits
    //   - redact a space-separated numeric run when its first group has at
    //     least two digits and at least one further numeric group follows
    // Internal horizontal whitespace is accepted, but punctuation, letters,
    // and line breaks stop the match. The terminating character is preserved.
    const GENERIC_NUMERIC_ID_PATTERN = /(?<!\d)(?:\d{2,}(?:[ \t]+\d+)+|\d{5,})(?!\d)/g;

    // Built-in UUID/document-ID rule. Each segment accepts either its normal
    // hexadecimal length or an existing [REDACTED] marker inside the segment.
    // This both prevents the numeric rule below from partially redacting a
    // fresh UUID and repairs UUIDs produced by older redactor versions.
    const UUID_REDACTED_MARKER_SOURCE = '\\[REDACTED\\]';
    const uuidSegmentSource = (length) =>
      `(?:[0-9a-f]{${length}}|[0-9a-f]*${UUID_REDACTED_MARKER_SOURCE}[0-9a-f]*)`;
    const UUID_DOCUMENT_ID_PATTERN = new RegExp(
      `(?<![\\p{L}\\p{N}_])` +
      `${uuidSegmentSource(8)}-${uuidSegmentSource(4)}-${uuidSegmentSource(4)}-` +
      `${uuidSegmentSource(4)}-${uuidSegmentSource(12)}` +
      `(?![\\p{L}\\p{N}_])`,
      'giu'
    );

    // Conservative address rules. A street name is automatically redacted
    // only when it has a house number, appears in a complete postal-address
    // line, or follows an explicit address label. This lets us support common
    // Norwegian road-name endings without redacting clinical phrases such as
    // "på vei hjem", "fri luftvei", or "alle prøvene var normale".
    const toCaseInsensitiveLiteralSource = (value) =>
      Array.from(value).map((character) => {
        const lower = character.toLocaleLowerCase('nb-NO');
        const upper = character.toLocaleUpperCase('nb-NO');
        if (lower === upper) return escapeRegex(character);
        return `[${escapeRegex(lower)}${escapeRegex(upper)}]`;
      }).join('');

    const ROAD_SUFFIXES = [
      'promenaden', 'promenade', 'terrassen', 'terrasse',
      'alléen', 'allé', 'alleen', 'alle', 'plassen', 'plass',
      'stranden', 'stranda', 'strand', 'bryggen', 'brygga',
      'brygge', 'svingen', 'sving', 'stubben', 'stredet',
      'skrenten', 'bakken', 'bakke', 'kroken', 'krok', 'toppen',
      'holtet', 'veien', 'vei', 'vegen', 'veg', 'gaten', 'gate',
      'gata', 'stien', 'sti', 'torget', 'torg', 'tunet', 'tun',
      'grenda', 'jordet', 'løkka', 'sletta', 'berget', 'hagen',
      'gangen', 'lunden', 'skogen', 'linna', 'åsen', 'faret',
      'myra', 'lien', 'lia', 'kleiva', 'enga', 'kaien', 'kaia',
      'kai'
    ];
    const ROAD_SUFFIX_SOURCE =
      `(?:${[...new Set(ROAD_SUFFIXES)]
        .sort((a, b) => b.length - a.length)
        .map(toCaseInsensitiveLiteralSource)
        .join('|')})`;
    const PROPER_NAME_WORD_SOURCE = "\\p{Lu}[\\p{L}'’.-]*";
    const BASE_COMPOUND_STREET_SOURCE =
      `\\p{Lu}[\\p{L}'’.-]{1,}${ROAD_SUFFIX_SOURCE}`;
    const STREET_MODIFIER_SOURCE =
      '(?:[Gg][Aa][Mm][Ll][Ee]|[Nn][Yy][Ee]|[Nn][Ee][Dd][Rr][Ee]|' +
      '[Øø][Vv][Rr][Ee]|[Nn][Oo][Rr][Dd][Rr][Ee]|' +
      '[Ss][Øø][Nn][Dd][Rr][Ee]|[Øø][Ss][Tt][Rr][Ee]|' +
      '[Vv][Ee][Ss][Tt][Rr][Ee]|[Ss][Tt][Oo][Rr][Ee]|' +
      '[Ll][Ii][Ll][Ll][Ee]|[Ii][Nn][Dd][Rr][Ee]|[Yy][Tt][Rr][Ee])';
    const COMPOUND_STREET_SOURCE =
      `(?:${STREET_MODIFIER_SOURCE}[ \\t]+){0,2}${BASE_COMPOUND_STREET_SOURCE}`;
    const SEPARATE_STREET_SOURCE =
      `(?:${PROPER_NAME_WORD_SOURCE}[ \\t]+){1,4}${ROAD_SUFFIX_SOURCE}`;
    const HOUSE_NUMBER_PART_SOURCE =
      '\\d{1,4}(?:[ \\t-]*[A-Za-zÆØÅæøå])?';
    const HOUSE_NUMBER_SOURCE =
      `${HOUSE_NUMBER_PART_SOURCE}(?:[ \\t]*[-–][ \\t]*${HOUSE_NUMBER_PART_SOURCE})?`;
    const STREET_ADDRESS_PATTERN = new RegExp(
      `(?<![\\p{L}\\p{N}_])(?:${COMPOUND_STREET_SOURCE}|${SEPARATE_STREET_SOURCE})` +
      `[ \\t]+${HOUSE_NUMBER_SOURCE}(?![\\p{L}\\p{N}_])(?![ \\t]+\\p{Ll})`,
      'gu'
    );
    const ADDRESS_LABEL_SOURCE =
      '(?:folkeregistrert[ \\t]+adresse|registrert[ \\t]+adresse|' +
      'tidligere[ \\t]+adresse|bostedsadresse|gateadresse|besøksadresse|' +
      'postadresse|oppholdsadresse|adresse(?:[ \\t]+[12])?|bosted|adr\\.?)';
    const LABELED_ADDRESS_PATTERN = new RegExp(
      `(\\b${ADDRESS_LABEL_SOURCE}[ \\t]*(?::|[-–])[ \\t]*)[^\\r\\n;]+`,
      'giu'
    );
    const ADDRESS_LABEL_NEXT_LINE_PATTERN = new RegExp(
      `(^[ \\t]*${ADDRESS_LABEL_SOURCE}[ \\t]*:?[ \\t]*\\r?\\n[ \\t]*)` +
      `(?=[^\\r\\n]*(?:\\d|postboks|postboksnr\\.?|pb\\.?|p\\.b\\.))[^\\r\\n;]+`,
      'gimu'
    );

    // A four-digit Norwegian postcode and place name provide enough context
    // to recognise road names that do not have a conventional suffix, such
    // as "Utsikten 12, 1850 Mysen". Requiring a complete standalone line
    // keeps ordinary prose and clinical measurements outside the match.
    const POSTAL_ADDRESS_WORD_SOURCE = "\\p{Lu}[\\p{L}'’.-]*";
    const POSTAL_ADDRESS_LAST_STREET_WORD_SOURCE =
      "\\p{Lu}[\\p{L}'’.-]{2,}";
    const POSTAL_ADDRESS_LINE_PATTERN = new RegExp(
      `(^[ \\t]*(?:[-•][ \\t]*)?)` +
      `(?:${POSTAL_ADDRESS_WORD_SOURCE}[ \\t]+){0,4}` +
      `${POSTAL_ADDRESS_LAST_STREET_WORD_SOURCE}[ \\t]+${HOUSE_NUMBER_SOURCE}` +
      `[ \\t]*(?:,[ \\t]*|[ \\t]+|\\r?\\n[ \\t]*)` +
      `\\d{4}[ \\t]+${POSTAL_ADDRESS_WORD_SOURCE}` +
      `(?:[ \\t]+${POSTAL_ADDRESS_WORD_SOURCE}){0,3}[ \\t]*(?=$|\\r?$)`,
      'gmu'
    );
    const POST_BOX_PATTERN =
      /\b(?:postboks|postboksnr\.?|pb\.?|p\.b\.)[ \t]*(?:nr\.?[ \t]*)?\d{1,6}\b/giu;

    // These generic address words occur in the user's General list, but are
    // not identifiers by themselves. General terms are therefore ignored for
    // these exact values and handled by the contextual rules above. Adding one
    // explicitly under Specific terms still preserves the user's override.
    const CONTEXTUAL_ONLY_GENERAL_TERMS = new Set([
      'adresse', 'bostedsadresse', 'gateadresse', 'besøksadresse',
      'postadresse', 'oppholdsadresse', 'bosted', 'postboks',
      'gate', 'gaten', 'gata', 'vei', 'veien', 'veg', 'vegen',
      'alle', 'allé', 'alleen', 'alléen', 'plass', 'plassen',
      'terrasse', 'terrassen'
    ]);

    const redactInText = (text, terms) => {
      let output = text || '';
      let replacedAny = false;

      // Structured identifiers must be handled before generic digit runs;
      // otherwise only a numeric fragment inside a UUID may be redacted.
      const updatedDocumentIds = output.replace(UUID_DOCUMENT_ID_PATTERN, '[REDACTED]');
      if (updatedDocumentIds !== output) {
        replacedAny = true;
        output = updatedDocumentIds;
      }

      const updatedNextLineAddresses = output.replace(
        ADDRESS_LABEL_NEXT_LINE_PATTERN,
        (_match, label) => `${label}[REDACTED]`
      );
      if (updatedNextLineAddresses !== output) {
        replacedAny = true;
        output = updatedNextLineAddresses;
      }

      const updatedLabeledAddresses = output.replace(
        LABELED_ADDRESS_PATTERN,
        (_match, label) => `${label}[REDACTED]`
      );
      if (updatedLabeledAddresses !== output) {
        replacedAny = true;
        output = updatedLabeledAddresses;
      }

      const updatedPostalAddresses = output.replace(
        POSTAL_ADDRESS_LINE_PATTERN,
        (_match, prefix) => `${prefix}[REDACTED]`
      );
      if (updatedPostalAddresses !== output) {
        replacedAny = true;
        output = updatedPostalAddresses;
      }

      const updatedPostBoxes = output.replace(POST_BOX_PATTERN, '[REDACTED]');
      if (updatedPostBoxes !== output) {
        replacedAny = true;
        output = updatedPostBoxes;
      }

      const updatedStreetAddresses = output.replace(STREET_ADDRESS_PATTERN, '[REDACTED]');
      if (updatedStreetAddresses !== output) {
        replacedAny = true;
        output = updatedStreetAddresses;
      }

      const updatedBirthdates = redactBirthdateFormatsInText(
        output,
        birthdateInputEl?.value || ''
      );
      if (updatedBirthdates.replacedAny) {
        replacedAny = true;
        output = updatedBirthdates.text;
      }

      // Apply generic numeric rules after structured IDs so a full spaced ID
      // is replaced as one unit without damaging UUID/address recognition.
      const updatedNumericIds = output.replace(GENERIC_NUMERIC_ID_PATTERN, '[REDACTED]');
      if (updatedNumericIds !== output) {
        replacedAny = true;
        output = updatedNumericIds;
      }

      // Preserve the pre-existing dedicated fødselsnummer rule as a separate
      // safeguard before applying user-entered terms.
      const updatedDigits = output.replace(ELEVEN_DIGIT_PATTERN, '[REDACTED]');
      if (updatedDigits !== output) {
        replacedAny = true;
        output = updatedDigits;
      }

      for (const term of terms) {
        const escaped = escapeRegex(term);
        const pattern = isWordOnlyRedactionTerm(term)
          ? new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'giu')
          : new RegExp(escaped, 'gi');
        const updated = output.replace(pattern, '[REDACTED]');
        if (updated !== output) {
          replacedAny = true;
          output = updated;
        }
      }

      return { text: output, replacedAny };
    };

    const getRedactorTerms = () => {
      const unique = new Set();
      const generalTerms = getLines(generalTermsEl?.value || '').filter((term) =>
        !CONTEXTUAL_ONLY_GENERAL_TERMS.has(term.toLocaleLowerCase('nb-NO'))
      );
      const specificTerms = getLines(redactorTermsEl?.value || '');

      return [...generalTerms, ...specificTerms]
        .sort((a, b) => b.length - a.length)
        .filter((term) => {
          const normalizedTerm = term.toLocaleLowerCase();
          if (unique.has(normalizedTerm)) return false;
          unique.add(normalizedTerm);
          return true;
        });
    };

    const revokeCurrentImageUrl = () => {
      if (!currentOcrImageObjectUrl) return;
      try {
        URL.revokeObjectURL(currentOcrImageObjectUrl);
      } catch (_) {}
      currentOcrImageObjectUrl = '';
    };

    registerWorkspaceDisposer(() => {
      editorGeneration += 1;
      for (const worker of ocrWorkers) {
        try { Promise.resolve(worker.terminate()).catch(() => {}); } catch (_) {}
      }
      ocrWorkers.clear();
      clearTimeout(cleanSpecificTimer);
      cleanSpecificTimer = null;
      revokeCurrentImageUrl();
      currentOcrImageBlob = null;
      if (redactorImagePreview) {
        redactorImagePreview.removeAttribute('src');
        redactorImagePreview.hidden = true;
      }
      if (redactorImagePlaceholder) redactorImagePlaceholder.hidden = false;
      if (fetchRedactorRawTextButton) {
        fetchRedactorRawTextButton.disabled = false;
        fetchRedactorRawTextButton.textContent = getRedactorStrings().fetchOcrRaw;
      }
      if (fetchRedactorImageTextButton) {
        fetchRedactorImageTextButton.disabled = false;
        fetchRedactorImageTextButton.textContent = getRedactorStrings().fetchOcrSpecific;
      }
      setRedactorStatus('');
    });

    const setOcrImage = (blob) => {
      if (!redactorImagePreview || !redactorImagePlaceholder) return;
      revokeCurrentImageUrl();
      currentOcrImageBlob = blob || null;

      if (!blob) {
        redactorImagePreview.hidden = true;
        redactorImagePreview.removeAttribute('src');
        redactorImagePlaceholder.hidden = false;
        return;
      }

      currentOcrImageObjectUrl = URL.createObjectURL(blob);
      redactorImagePreview.src = currentOcrImageObjectUrl;
      redactorImagePreview.hidden = false;
      redactorImagePlaceholder.hidden = true;
    };

    const setRedactorOpen = (isOpen, { persist = true } = {}) => {
      if (!supplementaryRedactorLayout || !redactorPane || !toggleRedactorButton) return;

      supplementaryRedactorLayout.classList.toggle('redactor-open', Boolean(isOpen));
      redactorPane.hidden = !isOpen;
      redactorPane.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      toggleRedactorButton.textContent = isOpen ? getRedactorStrings().hideRedactor : getRedactorStrings().showRedactor;
      toggleRedactorButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      if (persist) {
        try {
          localStorage.setItem(REDACTOR_VISIBILITY_KEY, isOpen ? '1' : '0');
        } catch (_) {}
      }
    };

    (() => {
      let shouldOpen = false;
      try {
        shouldOpen = localStorage.getItem(REDACTOR_VISIBILITY_KEY) === '1';
      } catch (_) {}
      setRedactorOpen(shouldOpen, { persist: false });
    })();

    applyRedactorTranslations();

    const exportTextFile = async (filename, content) => {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

      if (window.showSaveFilePicker) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'Text files',
              accept: { 'text/plain': ['.txt'] },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return { method: 'picker' };
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      return { method: 'download' };
    };

    const readTextFile = async (file) => {
      if (!file) return '';
      return file.text();
    };

    const BIRTHDATE_MAX_AGE = 130;
    const BIRTHDATE_MONTHS_NO = [
      ['januar', 'jan'],
      ['februar', 'feb', 'febr'],
      ['mars', 'mar'],
      ['april', 'apr'],
      ['mai'],
      ['juni', 'jun'],
      ['juli', 'jul'],
      ['august', 'aug'],
      ['september', 'sep', 'sept'],
      ['oktober', 'okt'],
      ['november', 'nov'],
      ['desember', 'des'],
    ];
    const BIRTHDATE_MONTHS_EN = [
      ['january', 'jan'],
      ['february', 'feb'],
      ['march', 'mar'],
      ['april', 'apr'],
      ['may'],
      ['june', 'jun'],
      ['july', 'jul'],
      ['august', 'aug'],
      ['september', 'sep', 'sept'],
      ['october', 'oct'],
      ['november', 'nov'],
      ['december', 'dec'],
    ];
    const BIRTHDATE_WEEKDAYS_NO = [
      'søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag',
    ];
    const BIRTHDATE_WEEKDAYS_EN = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
    ];

    const isValidCalendarDate = (day, month, year) => {
      const date = new Date(year, month - 1, day);
      return !Number.isNaN(date.getTime())
        && date.getFullYear() === year
        && date.getMonth() === month - 1
        && date.getDate() === day;
    };

    const normalizeNorwegianIdentityDateParts = (day, month) => {
      let normalizedDay = day;
      let normalizedMonth = month;

      // D-numbers encode the day with +40. H-numbers encode the month
      // with +40. Normal dates are left unchanged.
      if (normalizedDay >= 41 && normalizedDay <= 71) normalizedDay -= 40;
      if (normalizedMonth >= 41 && normalizedMonth <= 52) normalizedMonth -= 40;

      return { day: normalizedDay, month: normalizedMonth };
    };

    const getPlausibleTwoDigitBirthYears = (twoDigitYear, day, month) => {
      const now = new Date();
      const earliest = new Date(
        now.getFullYear() - BIRTHDATE_MAX_AGE,
        now.getMonth(),
        now.getDate()
      );
      const firstCentury = Math.floor(earliest.getFullYear() / 100) * 100;
      const lastCentury = Math.floor(now.getFullYear() / 100) * 100;
      const years = [];

      for (let century = firstCentury; century <= lastCentury; century += 100) {
        const year = century + twoDigitYear;
        if (!isValidCalendarDate(day, month, year)) continue;
        const candidate = new Date(year, month - 1, day);
        if (candidate < earliest || candidate > now) continue;
        years.push(year);
      }

      return years;
    };

    const parseBirthdateCandidates = (value) => {
      const raw = String(value || '').normalize('NFKC').trim();
      const digits = raw.replace(/\D/g, '');
      if (![6, 8, 11].includes(digits.length)) return [];

      let day = 0;
      let month = 0;
      let explicitYear = null;
      let twoDigitYear = 0;

      if (digits.length === 8) {
        const possibleIsoYear = Number(digits.slice(0, 4));
        const possibleIsoMonth = Number(digits.slice(4, 6));
        const possibleIsoDay = Number(digits.slice(6, 8));
        const nowYear = new Date().getFullYear();

        if (possibleIsoYear >= nowYear - BIRTHDATE_MAX_AGE
          && possibleIsoYear <= nowYear
          && isValidCalendarDate(possibleIsoDay, possibleIsoMonth, possibleIsoYear)) {
          day = possibleIsoDay;
          month = possibleIsoMonth;
          explicitYear = possibleIsoYear;
        } else {
          day = Number(digits.slice(0, 2));
          month = Number(digits.slice(2, 4));
          explicitYear = Number(digits.slice(4, 8));
        }
      } else {
        // For a complete identity number only the encoded date part is used.
        const dateDigits = digits.slice(0, 6);
        day = Number(dateDigits.slice(0, 2));
        month = Number(dateDigits.slice(2, 4));
        twoDigitYear = Number(dateDigits.slice(4, 6));
      }

      ({ day, month } = normalizeNorwegianIdentityDateParts(day, month));

      const years = explicitYear === null
        ? getPlausibleTwoDigitBirthYears(twoDigitYear, day, month)
        : [explicitYear];

      return years
        .filter((year) => isValidCalendarDate(day, month, year))
        .map((year) => ({
          day,
          month,
          year,
          dd: String(day).padStart(2, '0'),
          mm: String(month).padStart(2, '0'),
          yy: String(year).slice(-2),
          yyyy: String(year),
        }));
    };

    const getEnglishOrdinalSuffix = (day) => {
      const remainder100 = day % 100;
      if (remainder100 >= 11 && remainder100 <= 13) return 'th';
      if (day % 10 === 1) return 'st';
      if (day % 10 === 2) return 'nd';
      if (day % 10 === 3) return 'rd';
      return 'th';
    };

    const expandBirthdateFormats = (value) => {
      const variants = new Set();
      const add = (...values) => values.filter(Boolean).forEach((entry) => variants.add(entry));

      for (const candidate of parseBirthdateCandidates(value)) {
        const { day, month, year, dd, mm, yy, yyyy } = candidate;
        const d = String(day);
        const m = String(month);
        const dayForms = [...new Set([dd, d])];
        const monthForms = [...new Set([mm, m])];
        const yearForms = [yy, yyyy];

        add(`${dd}${mm}${yy}`, `${dd}${mm}${yyyy}`, `${yyyy}${mm}${dd}`);

        for (const dayForm of dayForms) {
          for (const monthForm of monthForms) {
            for (const yearForm of yearForms) {
              for (const separator of ['.', '-', '/', ' ', ',']) {
                add(`${dayForm}${separator}${monthForm}${separator}${yearForm}`);
              }
              add(
                `${dayForm} . ${monthForm} . ${yearForm}`,
                `${dayForm} - ${monthForm} - ${yearForm}`,
                `${dayForm} / ${monthForm} / ${yearForm}`,
                `${dayForm}.${monthForm}-${yearForm}`,
                `${dayForm}/${monthForm}-${yearForm}`,
                `${dayForm}-${monthForm}.${yearForm}`,
              );
            }
          }
        }

        for (const separator of ['-', '/', '.', ' ']) {
          add(
            `${yyyy}${separator}${mm}${separator}${dd}`,
            `${yyyy}${separator}${m}${separator}${d}`,
          );
        }

        const noMonths = BIRTHDATE_MONTHS_NO[month - 1] || [];
        const enMonths = BIRTHDATE_MONTHS_EN[month - 1] || [];
        const dateObj = new Date(year, month - 1, day);
        const weekdayNo = BIRTHDATE_WEEKDAYS_NO[dateObj.getDay()];
        const weekdayEn = BIRTHDATE_WEEKDAYS_EN[dateObj.getDay()];
        const ordinal = `${d}${getEnglishOrdinalSuffix(day)}`;

        for (const monthName of noMonths) {
          const isShort = monthName.length <= 4 && monthName !== 'mars';
          for (const yearForm of yearForms) {
            add(
              `${d} ${monthName} ${yearForm}`,
              `${d}. ${monthName} ${yearForm}`,
              `${dd} ${monthName} ${yearForm}`,
              `${dd}. ${monthName} ${yearForm}`,
            );
            if (isShort) {
              add(`${d} ${monthName}. ${yearForm}`, `${d}. ${monthName}. ${yearForm}`);
            }
          }
          add(
            `${weekdayNo} ${d}. ${monthName} ${yyyy}`,
            `${weekdayNo} ${d} ${monthName} ${yyyy}`,
          );
        }

        for (const monthName of enMonths) {
          const isShort = monthName.length <= 4;
          for (const yearForm of yearForms) {
            add(
              `${d} ${monthName} ${yearForm}`,
              `${d} ${monthName}, ${yearForm}`,
              `${monthName} ${d} ${yearForm}`,
              `${monthName} ${d}, ${yearForm}`,
              `${ordinal} ${monthName} ${yearForm}`,
              `${monthName} ${ordinal}, ${yearForm}`,
            );
            if (isShort) {
              add(`${d} ${monthName}. ${yearForm}`, `${monthName}. ${d}, ${yearForm}`);
            }
          }
          add(
            `${weekdayEn}, ${monthName} ${d}, ${yyyy}`,
            `${weekdayEn} ${d} ${monthName} ${yyyy}`,
          );
        }
      }

      return [...variants];
    };

    const BIRTHDATE_SEPARATOR_SOURCE =
      '(?:[ \\t]*[.\\/,\\-–—][ \\t]*|[ \\t]+)';

    const getBirthdateNumberSource = (number) => {
      const plain = String(number);
      return number < 10 ? `(?:0?${plain})` : plain;
    };

    const getBirthdateMonthNameSource = (monthForms) =>
      `(?:${monthForms
        .map((monthName) => `${escapeRegex(monthName)}\\.?`)
        .join('|')})`;

    const getBirthdateRedactionPatterns = (value) => {
      const sources = new Set();

      for (const candidate of parseBirthdateCandidates(value)) {
        const { day, month, dd, mm, yy, yyyy } = candidate;
        const daySource = getBirthdateNumberSource(day);
        const monthSource = getBirthdateNumberSource(month);
        const yearSource = `(?:${yyyy}|${yy})`;
        const ordinalDaySource = `${daySource}(?:st|nd|rd|th)?`;
        const noMonthSource = getBirthdateMonthNameSource(BIRTHDATE_MONTHS_NO[month - 1] || []);
        const enMonthSource = getBirthdateMonthNameSource(BIRTHDATE_MONTHS_EN[month - 1] || []);

        sources.add(`${daySource}${BIRTHDATE_SEPARATOR_SOURCE}${monthSource}${BIRTHDATE_SEPARATOR_SOURCE}${yearSource}`);
        sources.add(`${yyyy}${BIRTHDATE_SEPARATOR_SOURCE}${monthSource}${BIRTHDATE_SEPARATOR_SOURCE}${daySource}`);
        sources.add(`${monthSource}${BIRTHDATE_SEPARATOR_SOURCE}${daySource}${BIRTHDATE_SEPARATOR_SOURCE}${yearSource}`);
        sources.add(`(?:${dd}${mm}${yy}|${dd}${mm}${yyyy}|${yyyy}${mm}${dd}|${mm}${dd}${yy}|${mm}${dd}${yyyy})`);

        if (noMonthSource !== '(?:)') {
          sources.add(`${daySource}\\.?${BIRTHDATE_SEPARATOR_SOURCE}${noMonthSource}${BIRTHDATE_SEPARATOR_SOURCE}${yearSource}`);
        }
        if (enMonthSource !== '(?:)') {
          sources.add(`${ordinalDaySource}\\.?${BIRTHDATE_SEPARATOR_SOURCE}${enMonthSource}${BIRTHDATE_SEPARATOR_SOURCE}${yearSource}`);
          sources.add(`${enMonthSource}${BIRTHDATE_SEPARATOR_SOURCE}${ordinalDaySource}${BIRTHDATE_SEPARATOR_SOURCE}${yearSource}`);
        }
      }

      return [...sources].map((source) => new RegExp(
        `(?<![\\p{L}\\p{N}_])(?:${source})(?![\\p{L}\\p{N}_])`,
        'giu'
      ));
    };

    const getOcrTolerantDigitSource = (digits) => Array.from(String(digits))
      .map((digit) => {
        if (digit === '0') return '[0Oo]';
        if (digit === '1') return '[1Il]';
        return digit;
      })
      .join('');

    const getOcrTolerantNumberSource = (number, paddedWidth = 0) => {
      const plain = String(number);
      const padded = paddedWidth ? plain.padStart(paddedWidth, '0') : plain;
      const variants = new Set([
        getOcrTolerantDigitSource(plain),
        getOcrTolerantDigitSource(padded),
      ]);
      return `(?:${[...variants].join('|')})`;
    };

    const getLabeledOcrBirthdatePatterns = (value) => {
      const labelSource =
        '(?:fødselsdato|født|f\\.?[ \\t]*dato|dob|date[ \\t]+of[ \\t]+birth|born)';
      const patterns = [];

      for (const candidate of parseBirthdateCandidates(value)) {
        const daySource = getOcrTolerantNumberSource(candidate.day, 2);
        const monthSource = getOcrTolerantNumberSource(candidate.month, 2);
        const fullYearSource = getOcrTolerantDigitSource(candidate.yyyy);
        const yearSource = `(?:${fullYearSource}|${getOcrTolerantDigitSource(candidate.yy)})`;
        const separatorSource = '(?:[ \\t]*[.\\/,\\-–—][ \\t]*|[ \\t]+)';
        const dateSource =
          `(?:${daySource}${separatorSource}${monthSource}${separatorSource}${yearSource}|` +
          `${fullYearSource}${separatorSource}${monthSource}${separatorSource}${daySource})`;

        patterns.push(new RegExp(
          `(\\b${labelSource}[ \\t]*(?::|[-–])?[ \\t]*)${dateSource}`,
          'giu'
        ));
      }

      return patterns;
    };

    const redactBirthdateFormatsInText = (text, value) => {
      let output = text || '';
      let replacedAny = false;

      for (const pattern of getBirthdateRedactionPatterns(value)) {
        const updated = output.replace(pattern, '[REDACTED]');
        if (updated !== output) {
          replacedAny = true;
          output = updated;
        }
      }

      // OCR commonly confuses 0/O and 1/I/l. Tolerate those substitutions only
      // after an explicit birthdate label, where the risk of false positives is low.
      for (const pattern of getLabeledOcrBirthdatePatterns(value)) {
        const updated = output.replace(pattern, (_match, label) => `${label}[REDACTED]`);
        if (updated !== output) {
          replacedAny = true;
          output = updated;
        }
      }

      return { text: output, replacedAny };
    };

    const readClipboardImage = async () => {
      if (!navigator.clipboard || typeof navigator.clipboard.read !== 'function') {
        throw new Error('Clipboard image reading is not available in this browser. Use Ctrl + V in the image frame or upload an image instead.');
      }

      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          return item.getType(imageType);
        }
      }

      return null;
    };

    const handleImagePasteEvent = (event) => {
      const items = Array.from(event.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type && item.type.startsWith('image/'));
      if (!imageItem) return false;

      const file = imageItem.getAsFile();
      if (!file) return false;

      event.preventDefault();
      setOcrImage(file);
      setRedactorStatusByKey('imagePastedReady');
      return true;
    };

    const runTesseractOnCurrentImage = async ({ logger } = {}) => {
      const generation = editorGeneration;
      const imageBlob = currentOcrImageBlob;
      let recognizedText = '';
      let usedLanguage = 'nor+eng';
      const ensureCurrent = () => {
        if (generation === editorGeneration) return;
        const error = new Error('OCR was cancelled because the Workspace closed.');
        error.name = 'AbortError';
        throw error;
      };
      const safeLogger = (message) => {
        if (generation === editorGeneration) logger?.(message);
      };
      const recognize = async (language) => {
        const worker = await window.Tesseract.createWorker(language, 1, { logger: safeLogger });
        ocrWorkers.add(worker);
        try {
          ensureCurrent();
          return await worker.recognize(imageBlob);
        } finally {
          // The disposer may already have terminated this worker.
          if (ocrWorkers.delete(worker)) await worker.terminate().catch(() => {});
        }
      };

      try {
        const result = await recognize('nor+eng');
        ensureCurrent();
        recognizedText = result?.data?.text || '';
      } catch (primaryError) {
        ensureCurrent();
        const fallback = await recognize('eng');
        ensureCurrent();
        recognizedText = fallback?.data?.text || '';
        usedLanguage = 'eng';
      }

      recognizedText = normalizeNewlines(recognizedText).trim();
      return { recognizedText, usedLanguage };
    };

    const setRawOcrOutput = (text) => {
      if (!ocrRawOutputEl) return;
      ocrRawOutputEl.value = normalizeNewlines(text || '').trim();
      persistRedactorTextState();
    };

    const runRawOcrOnCurrentImage = async () => {
      if (!currentOcrImageBlob) {
        setRedactorStatusByKey('noImageForOcr', {}, true);
        return;
      }

      if (!window.Tesseract) {
        setRedactorStatusByKey('tesseractLoadFailed', {}, true);
        return;
      }

      const logger = (message) => {
        if (!message || !message.status) return;
        if (message.status === 'recognizing text' && typeof message.progress === 'number') {
          setRedactorStatusByKey('ocrRunning', { progress: Math.round(message.progress * 100) });
          return;
        }
        if (message.status === 'loading language traineddata') {
          setRedactorStatusByKey('ocrLoadingLanguageData');
          return;
        }
        if (message.status === 'initializing tesseract') {
          setRedactorStatusByKey('ocrStarting');
        }
      };

      const originalLabel = fetchRedactorRawTextButton?.textContent || getRedactorStrings().fetchOcrRaw;
      const generation = editorGeneration;
      if (fetchRedactorRawTextButton) {
        fetchRedactorRawTextButton.disabled = true;
        fetchRedactorRawTextButton.textContent = getRedactorStrings().fetching;
      }

      try {
        const { recognizedText, usedLanguage } = await runTesseractOnCurrentImage({ logger });

        if (!recognizedText) {
          setRedactorStatusByKey('noTextDetected', {}, true);
          return;
        }

        setRawOcrOutput(recognizedText);
        setRedactorStatusByKey('rawOcrComplete', { usedLanguage });
      } catch (error) {
        if (error?.name === 'AbortError') return;
        setRedactorStatusByKey('ocrError', { errorMessage: error?.message || error }, true);
      } finally {
        if (generation === editorGeneration && fetchRedactorRawTextButton) {
          fetchRedactorRawTextButton.disabled = false;
          fetchRedactorRawTextButton.textContent = originalLabel;
        }
      }
    };

    const runOcrOnCurrentImage = async () => {
      if (!currentOcrImageBlob) {
        setRedactorStatusByKey('noImageForOcr', {}, true);
        return;
      }

      if (!window.Tesseract) {
        setRedactorStatusByKey('tesseractLoadFailed', {}, true);
        return;
      }

      const logger = (message) => {
        if (!message || !message.status) return;
        if (message.status === 'recognizing text' && typeof message.progress === 'number') {
          setRedactorStatusByKey('ocrRunning', { progress: Math.round(message.progress * 100) });
          return;
        }
        if (message.status === 'loading language traineddata') {
          setRedactorStatusByKey('ocrLoadingLanguageData');
          return;
        }
        if (message.status === 'initializing tesseract') {
          setRedactorStatusByKey('ocrStarting');
        }
      };

      const originalLabel = fetchRedactorImageTextButton?.textContent || getRedactorStrings().fetchOcrSpecific;
      const generation = editorGeneration;
      if (fetchRedactorImageTextButton) {
        fetchRedactorImageTextButton.disabled = true;
        fetchRedactorImageTextButton.textContent = getRedactorStrings().fetching;
      }

      try {
        const { recognizedText, usedLanguage } = await runTesseractOnCurrentImage({ logger });

        if (!recognizedText) {
          setRedactorStatusByKey('noTextDetected', {}, true);
          return;
        }

        const finalText = normalizeIncomingSpecificText(recognizedText);

        if (!finalText.trim()) {
          setRedactorStatusByKey('noSpecificTermsProduced', {}, true);
          return;
        }

        const currentSpecific = redactorTermsEl?.value || '';
        const mergedSpecific = cleanSpecificBlock(
          currentSpecific
            ? `${currentSpecific}\n${finalText}`
            : finalText
        );

        const beforeCount = getLines(currentSpecific).length;
        const afterCount = getLines(mergedSpecific).length;

        if (redactorTermsEl) {
          redactorTermsEl.value = mergedSpecific;
          persistRedactorTextState();
        }

        const detectedBirthdate = extractBirthdateFromFnrText(finalText || recognizedText);
        if (detectedBirthdate && birthdateInputEl) {
          birthdateInputEl.value = detectedBirthdate;
          persistRedactorTextState();
        }

        const addedCount = Math.max(0, afterCount - beforeCount);
        if (!addedCount) {
          setRedactorStatusByKey('noNewUniqueTerms', { usedLanguage });
          return;
        }

        setRedactorStatusByKey(
          detectedBirthdate ? 'ocrCompleteAddedSpecificBirthdate' : 'ocrCompleteAddedSpecific',
          detectedBirthdate ? { usedLanguage, addedCount, detectedBirthdate } : { usedLanguage, addedCount }
        );
      } catch (error) {
        if (error?.name === 'AbortError') return;
        setRedactorStatusByKey('ocrError', { errorMessage: error?.message || error }, true);
      } finally {
        if (generation === editorGeneration && fetchRedactorImageTextButton) {
          fetchRedactorImageTextButton.disabled = false;
          fetchRedactorImageTextButton.textContent = originalLabel;
        }
      }
    };


    if (toggleRedactorButton) {
      toggleRedactorButton.addEventListener('click', () => {
        const isOpen = !supplementaryRedactorLayout?.classList.contains('redactor-open');
        setRedactorOpen(isOpen);
        setRedactorStatus('');
        if (isOpen) {
          redactorTermsEl?.focus();
        }
      });
    }

    // Clear button logic for supplementary field
    const clearSupplementaryButton = document.getElementById('clearSupplementaryButton');
    if (clearSupplementaryButton) {
      clearSupplementaryButton.addEventListener('click', () => {
        if (supplementaryInfoEl) {
          resetSupplementaryTextareaSticky({ focus: false });
        }
      });
    }

    if (clearGeneralTermsButton) {
      clearGeneralTermsButton.addEventListener('click', () => {
        if (generalTermsEl) {
          resetTextareaToDefault(generalTermsEl);
          persistRedactorTextState();
        }
        setRedactorStatusByKey('generalTermsCleared');
      });
    }

    if (clearRedactorButton) {
      clearRedactorButton.addEventListener('click', () => {
        if (redactorTermsEl) {
          resetTextareaToDefault(redactorTermsEl);
        }
        if (birthdateInputEl) {
          birthdateInputEl.value = '';
        }
        persistRedactorTextState();
        setRedactorStatusByKey('specificTermsCleared');
      });
    }

    if (uploadGeneralTermsButton && generalTermsFileInput) {
      uploadGeneralTermsButton.addEventListener('click', () => {
        generalTermsFileInput.click();
      });
    }

    if (generalTermsFileInput) {
      generalTermsFileInput.addEventListener('change', async () => {
        const file = generalTermsFileInput.files && generalTermsFileInput.files[0];
        if (!file) return;

        try {
          const text = await readTextFile(file);
          if (generalTermsEl) {
            generalTermsEl.value = normalizeNewlines(text).trim();
            persistRedactorTextState();
          }
          setRedactorStatusByKey('loadedGeneralFile', { fileName: file.name });
        } catch (error) {
          setRedactorStatusByKey('couldNotReadFile', { fileName: file.name, errorMessage: error?.message || error }, true);
        } finally {
          generalTermsFileInput.value = '';
        }
      });
    }

    if (exportGeneralTermsButton) {
      exportGeneralTermsButton.addEventListener('click', async () => {
        const content = normalizeNewlines(generalTermsEl?.value || '').trim();

        try {
          const result = await exportTextFile('General.txt', content);
          if (result?.method === 'picker') {
            setRedactorStatusByKey('savedGeneralSelectedLocation');
          } else {
            setRedactorStatusByKey('savedGeneralDownloadFlow');
          }
        } catch (error) {
          if (error && error.name === 'AbortError') {
            setRedactorStatusByKey('saveCanceled');
            return;
          }
          setRedactorStatusByKey('couldNotExportGeneral', { errorMessage: error?.message || error }, true);
        }
      });
    }

    if (downloadTranscriptButton) {
      downloadTranscriptButton.addEventListener('click', async () => {
        const content = transcriptionEl?.value || '';
        if (!content.trim()) {
          setRedactorStatusByKey('noMatchingText', {}, true);
          return;
        }
        try {
          await exportTextFile('Redacted.txt', content);
        } catch (error) {
          if (error && error.name === 'AbortError') return;
          console.warn('[redactor] download transcript failed', error);
        }
      });
    }

    const copyRedactedTranscriptToClipboard = async (text) => {
      const value = String(text || '');
      if (!value.trim()) return false;

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(value);
          return true;
        } catch (_) {}
      }

      // Fallback for browsers or contexts where the Clipboard API is
      // unavailable. Use a temporary field so the user's current selection
      // in the app is not changed.
      const activeElement = document.activeElement;
      const temporaryField = document.createElement('textarea');
      temporaryField.value = value;
      temporaryField.setAttribute('readonly', '');
      temporaryField.style.position = 'fixed';
      temporaryField.style.left = '-9999px';
      temporaryField.style.top = '0';
      temporaryField.style.opacity = '0';
      document.body.appendChild(temporaryField);
      temporaryField.focus();
      temporaryField.select();
      temporaryField.setSelectionRange(0, value.length);

      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (_) {
        copied = false;
      } finally {
        temporaryField.remove();
        try {
          activeElement?.focus?.({ preventScroll: true });
        } catch (_) {
          activeElement?.focus?.();
        }
      }

      return copied;
    };

    const requestRedactorAutocopyExtension = (text) => {
      const value = String(text || '');
      if (!value.trim()) return false;

      try {
        // The extension reads the finished text directly from #transcription.
        // Only non-sensitive metadata is included in the event detail.
        window.dispatchEvent(
          new CustomEvent('redactor:autocopy', {
            detail: {
              textLength: value.length,
              requestedAt: Date.now(),
            },
          })
        );
        return true;
      } catch (_) {
        return false;
      }
    };

    if (applyRedactionButton) {
      applyRedactionButton.addEventListener('click', async () => {
        const terms = getRedactorTerms();
        let replacedAny = false;

        if (transcriptionEl) {
          const result = redactInText(transcriptionEl.value || '', terms);
          transcriptionEl.value = result.text;
          replacedAny = replacedAny || result.replacedAny;
        }

        if (supplementaryInfoEl) {
          const result = redactInText(supplementaryInfoEl.value || '', terms);
          supplementaryInfoEl.value = result.text;
          replacedAny = replacedAny || result.replacedAny;
        }

        // If nothing matched AND the user supplied no terms, surface
        // the original "add at least one term" hint so they know why
        // nothing happened. If they did supply terms but nothing
        // matched, surface "no matching text" as before.
        if (!replacedAny && !terms.length) {
          setRedactorStatusByKey('addAtLeastOneTerm', {}, true);
          (redactorTermsEl || generalTermsEl)?.focus();
        } else if (replacedAny && !terms.length) {
          setRedactorStatusByKey('redactionComplete');
        } else {
          setRedactorStatusByKey(
            replacedAny ? 'redactedTerms' : 'noMatchingText',
            replacedAny ? { termCount: terms.length } : {}
          );
        }

        if (redactorAutocopyToggle?.checked && (transcriptionEl?.value || '').trim()) {
          const redactedTranscript = transcriptionEl.value || '';
          const copied = await copyRedactedTranscriptToClipboard(redactedTranscript);
          requestRedactorAutocopyExtension(redactedTranscript);
          if (!copied) {
            setRedactorStatusByKey('redactedTranscriptCopyFailed', {}, true);
          }
        }
      });
    }

    if (addBirthdateFormatsButton) {
      addBirthdateFormatsButton.addEventListener('click', () => {
        const variants = expandBirthdateFormats(birthdateInputEl?.value || '');
        if (!variants.length) {
          setRedactorStatusByKey('invalidBirthdate', {}, true);
          birthdateInputEl?.focus();
          return;
        }

        const addedCount = appendUniqueLines(redactorTermsEl, variants.join('\n'));
        if (!addedCount) {
          setRedactorStatusByKey('birthdateAlreadyPresent');
          return;
        }

        setRedactorStatusByKey('addedBirthdateFormats', { addedCount });
      });
    }

    if (pasteRedactorImageButton) {
      pasteRedactorImageButton.addEventListener('click', async () => {
        try {
          const blob = await readClipboardImage();
          if (!blob) {
            setRedactorStatusByKey('clipboardNoImage', {}, true);
            return;
          }
          setOcrImage(blob);
          setRedactorStatusByKey('imagePastedReady');
        } catch (error) {
          setRedactorStatusByKey('clipboardReadImageFailed', { errorMessage: error?.message || 'Could not read an image from the clipboard.' }, true);
        }
      });
    }

    if (redactorImageUpload) {
      redactorImageUpload.addEventListener('change', () => {
        const file = redactorImageUpload.files && redactorImageUpload.files[0];
        if (!file) return;
        setOcrImage(file);
        setRedactorStatusByKey('loadedImage', { fileName: file.name });
        redactorImageUpload.value = '';
      });
    }

    if (clearRedactorImageButton) {
      clearRedactorImageButton.addEventListener('click', () => {
        setOcrImage(null);
        setRedactorStatusByKey('imageCleared');
      });
    }

    if (fetchRedactorImageTextButton) {
      fetchRedactorImageTextButton.addEventListener('click', runOcrOnCurrentImage);
    }

    if (fetchRedactorRawTextButton) {
      fetchRedactorRawTextButton.addEventListener('click', runRawOcrOnCurrentImage);
    }

    if (copyRedactorRawOutputButton) {
      copyRedactorRawOutputButton.addEventListener('click', async () => {
        const rawText = ocrRawOutputEl?.value || '';
        if (!rawText.trim()) {
          setRedactorStatusByKey('rawTextEmpty', {}, true);
          return;
        }
        try {
          await navigator.clipboard.writeText(rawText);
          setRedactorStatusByKey('rawTextCopied');
        } catch (error) {
          setRedactorStatusByKey('rawTextCopyFailed', {}, true);
        }
      });
    }

    if (clearRedactorRawOutputButton) {
      clearRedactorRawOutputButton.addEventListener('click', () => {
        if (!ocrRawOutputEl) return;
        resetTextareaToDefault(ocrRawOutputEl);
        persistRedactorTextState();
        setRedactorStatusByKey('rawTextCleared');
      });
    }

    if (redactorImageFrame) {
      redactorImageFrame.addEventListener('focusin', () => {
        redactorImageFrame.classList.add('is-focus');
      });
      redactorImageFrame.addEventListener('focusout', () => {
        redactorImageFrame.classList.remove('is-focus');
      });
      redactorImageFrame.addEventListener('paste', (event) => {
        if (handleImagePasteEvent(event)) {
          redactorImageFrame.focus();
        }
      });
      redactorImageFrame.addEventListener('click', () => {
        redactorImageFrame.focus();
      });
      redactorImageFrame.addEventListener('keydown', async (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
          setRedactorStatusByKey('pasteFromClipboardHint');
        }
      });
    }

    // Sticky date support for Supplementary information.
    const supplementaryDateToggle = document.getElementById('supplementaryDateToggle');
    const insertSupplementaryDateButton = document.getElementById('insertSupplementaryDateButton');

    if (supplementaryDateToggle && supplementaryDateToggle.type === 'checkbox') {
      try {
        if (sessionStorage.getItem(SUPPLEMENTARY_DATE_TOGGLE_KEY) == null) {
          sessionStorage.setItem(SUPPLEMENTARY_DATE_TOGGLE_KEY, '0');
        }
      } catch (_) {}

      supplementaryDateToggle.checked = getSupplementaryDateToggleState();
      syncSupplementaryStickyDate({ focus: false, resetView: true });

      supplementaryDateToggle.addEventListener('change', () => {
        if (supplementaryInfoEl) delete supplementaryInfoEl.dataset.preserveHistoricalDate;
        try {
          sessionStorage.setItem(
            SUPPLEMENTARY_DATE_TOGGLE_KEY,
            supplementaryDateToggle.checked ? '1' : '0'
          );
        } catch (_) {}
        syncSupplementaryStickyDate({ focus: supplementaryDateToggle.checked, resetView: true });
      });
    }

    // Back-compat: keep supporting the old Date button if it still exists.
    if (insertSupplementaryDateButton) {
      insertSupplementaryDateButton.addEventListener('click', () => {
        if (!supplementaryInfoEl) return;
        delete supplementaryInfoEl.dataset.preserveHistoricalDate;
        supplementaryInfoEl.value = normalizeSupplementaryDateLine(supplementaryInfoEl.value, {
          enabled: true,
        });
        supplementaryInfoEl.dispatchEvent(new Event('input', { bubbles: true }));
        supplementaryInfoEl.focus();
        const pos = getTodaySupplementaryDateLine().length;
        try { supplementaryInfoEl.setSelectionRange(pos, pos); } catch (_) {}
      });
    }

    bindSupplementaryStickyDateBlur();

    // Auto-clear toggle (default OFF; persist in localStorage)
    const AUTO_CLEAR_KEY = 'auto_clear_supplementary';
    const autoClearToggle = document.getElementById('autoClearSupplementaryToggle');
    if (autoClearToggle) {
      const stored = localStorage.getItem(AUTO_CLEAR_KEY);
      autoClearToggle.checked = stored === '1';
      autoClearToggle.addEventListener('change', () => {
        localStorage.setItem(AUTO_CLEAR_KEY, autoClearToggle.checked ? '1' : '0');
      });
    }

    // When enabled: starting a new recording clears + resets Supplementary info,
    // while preserving the sticky date if that toggle is enabled.
    document.addEventListener('click', (e) => {
      const id = e.target && e.target.id;
      if (id !== 'startButton') return;
      if (!autoClearToggle || autoClearToggle.checked !== true) return;
      if (supplementaryInfoEl) resetSupplementaryTextareaSticky({ focus: false });
    }, true);

    // Note Auto-clear toggle (default OFF; persist in localStorage)
    const AUTO_CLEAR_NOTE_KEY = 'auto_clear_note';
    const autoClearNoteToggle = document.getElementById('autoClearNoteToggle');
    const generatedNoteFieldEl = document.getElementById('generatedNote');
    if (autoClearNoteToggle) {
      const stored = localStorage.getItem(AUTO_CLEAR_NOTE_KEY);
      autoClearNoteToggle.checked = stored === '1';
      autoClearNoteToggle.addEventListener('change', () => {
        localStorage.setItem(AUTO_CLEAR_NOTE_KEY, autoClearNoteToggle.checked ? '1' : '0');
      });
    }

    // When enabled: starting a new recording clears + resets Generated note.
    document.addEventListener('click', (e) => {
      const id = e.target && e.target.id;
      if (id !== 'startButton') return;
      if (!autoClearNoteToggle || autoClearNoteToggle.checked !== true) return;
      if (generatedNoteFieldEl) resetTextareaToDefault(generatedNoteFieldEl);
    }, true);

  // Copy button logic for transcription field (matches Generated Note copy behavior)
  const copyTranscriptionButton = document.getElementById('copyTranscriptionButton');
  if (copyTranscriptionButton) {
    const originalLabel = copyTranscriptionButton.textContent;
    copyTranscriptionButton.addEventListener('click', async () => {
      const trEl = document.getElementById('transcription');
      const value = (trEl?.value || '').trim();
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        copyTranscriptionButton.textContent = 'Copied';
        setTimeout(() => { copyTranscriptionButton.textContent = originalLabel; }, 1200);
      } catch (err) {
        // Fallback for older browsers / blocked clipboard permissions
        try {
          trEl?.focus();
          trEl?.select();
          document.execCommand('copy');
          copyTranscriptionButton.textContent = 'Copied';
          setTimeout(() => { copyTranscriptionButton.textContent = originalLabel; }, 1200);
        } catch (_) {
          console.warn('Copy failed', err);
        } finally {
          try { window.getSelection()?.removeAllRanges?.(); } catch (_) {}
        }
      }
    });
  }
  // Clear button logic for transcription field
  const clearTranscriptionButton = document.getElementById('clearTranscriptionButton');
  if (clearTranscriptionButton) {
    clearTranscriptionButton.addEventListener('click', () => {
      const trEl = document.getElementById('transcription');
      if (trEl) {
        resetTextareaToDefault(trEl);
      }
    });
  }
  });
