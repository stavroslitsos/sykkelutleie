import { PromptManager } from "../promptManager.js";
import { PromptCloudBackup } from "./prompt-cloud-backup.js";
import { CloudBackupSession } from "./cloud-backup-session.js";

const promptSlotSelect = document.getElementById("promptSlot");
const promptSlotPicker = document.getElementById("promptSlotPicker");
const promptSlotTrigger = document.getElementById("promptSlotTrigger");
const promptSlotTriggerSlot = document.getElementById("promptSlotTriggerSlot");
const promptSlotTriggerName = document.getElementById("promptSlotTriggerName");
const promptSlotPopover = document.getElementById("promptSlotPopover");
const promptSlotList = document.getElementById("promptSlotList");
const customPromptTextarea = document.getElementById("customPrompt");
const clearPromptButton = document.getElementById("clearPromptButton");
const copyPromptButton = document.getElementById("copyPromptButton");
const promptSlotNameInput = document.getElementById("promptSlotName");

const promptExportBtn = document.getElementById("promptExportBtn");
const promptImportBtn = document.getElementById("promptImportBtn");
const promptImportFile = document.getElementById("promptImportFile");
const promptBackupStatus = document.getElementById("promptBackupStatus");
const redactorGeneralTerms = document.getElementById("redactorGeneralTerms");
const promptBackupModal = {
  backdrop: document.getElementById("promptBackupModalBackdrop"),
  card: document.getElementById("promptBackupModal"),
  title: document.getElementById("promptBackupModalTitle"),
  close: document.getElementById("promptBackupModalClose"),
  choiceStep: document.getElementById("promptBackupChoiceStep"),
  choiceNotice: document.getElementById("promptBackupChoiceNotice"),
  jsonChoice: document.getElementById("promptBackupJsonChoice"),
  jsonHelp: document.getElementById("promptBackupJsonHelp"),
  oneDriveChoice: document.getElementById("promptBackupOneDriveChoice"),
  oneDriveHelp: document.getElementById("promptBackupOneDriveHelp"),
  googleDriveChoice: document.getElementById("promptBackupGoogleDriveChoice"),
  googleDriveHelp: document.getElementById("promptBackupGoogleDriveHelp"),
  cloudStep: document.getElementById("promptBackupCloudStep"),
  cloudNotice: document.getElementById("promptBackupCloudNotice"),
  passwordLabel: document.getElementById("promptBackupPasswordLabel"),
  password: document.getElementById("promptBackupPassword"),
  passwordConfirmWrap: document.getElementById("promptBackupPasswordConfirmWrap"),
  passwordConfirmLabel: document.getElementById("promptBackupPasswordConfirmLabel"),
  passwordConfirm: document.getElementById("promptBackupPasswordConfirm"),
  cloudAction: document.getElementById("promptBackupCloudAction"),
  cloudBack: document.getElementById("promptBackupCloudBack"),
  status: document.getElementById("promptBackupModalStatus"),
};
const MINI_HUB_UI_REFRESH_EVENT = "mini-hub:prompt-ui-refresh";

const PROMPT_BACKUP_TEXT = {
  en: {
    close: "Close",
    exportTitle: "Export prompts",
    importTitle: "Import prompts",
    exportNotice: "Before exporting, make sure every prompt you want to back up is filled in. All 20 saved prompt slots and their labels are included; empty slots are saved as empty. Cloud export also saves General terms as a separate encrypted backup when that field contains text. Specific terms are never included.",
    importNotice: "Import replaces all 20 prompt slots and their labels saved in this browser. A JSON or cloud backup must already have been created. Cloud import also restores an available General terms backup for this tab; Specific terms are never imported.",
    exportJson: "Export as JSON file",
    importJson: "Import from JSON file",
    exportJsonHelp: "Uses the existing method and saves a readable JSON file on this device. Store the file securely.",
    importJsonHelp: "Uses the existing method: choose a previously exported prompt JSON file from this device.",
    exportOneDrive: "Export to Microsoft OneDrive",
    importOneDrive: "Import from Microsoft OneDrive",
    exportOneDriveHelp: "Encrypts the saved prompt list in this browser and stores one prompt backup in your private Microsoft OneDrive app folder. If General terms contains text, it is encrypted and saved as a separate backup. An empty General terms field never overwrites an earlier General terms backup.",
    importOneDriveHelp: "Sign in with the same personal Microsoft account and enter the backup password. Prompts and any available General terms backup are downloaded from your private OneDrive app folder.",
    exportGoogleDrive: "Export to Google Drive",
    importGoogleDrive: "Import from Google Drive",
    exportGoogleDriveHelp: "Encrypts the saved prompt list in this browser and stores one prompt backup in your private Google Drive app storage. If General terms contains text, it is encrypted and saved as a separate backup. An empty General terms field never overwrites an earlier General terms backup.",
    importGoogleDriveHelp: "Sign in with the same Google account and enter the backup password. Prompts and any available General terms backup are downloaded from private Google Drive app storage.",
    exportCloudNotice: "Create a Cloud Backup Password for this provider. It is used for keys, prompt lists and Workspace Sets, kept only in this tab session and never uploaded. If you forget it, the backup cannot be restored.",
    importCloudNotice: "Enter the Cloud Backup Password for this provider. It is kept only in this tab session and never uploaded.",
    unlockedCloudNotice: "Your unlocked Cloud Backup Password for {provider} will be used.",
    legacyPasswordNotice: "This older prompt backup uses a different password. Enter its previous password to import it. You can then update it to the unified Cloud Backup Password.",
    migrateLegacy: "This prompt backup used an older password. Update it now to use your current Cloud Backup Password?",
    newPassword: "Encryption password (minimum 10 characters)",
    currentPassword: "Encryption password",
    repeatPassword: "Repeat password",
    saveOneDrive: "Save to OneDrive",
    saveGoogleDrive: "Save to Google Drive",
    importOneDriveAction: "Import from OneDrive",
    importGoogleDriveAction: "Import from Google Drive",
    back: "Back",
    loadingGoogle: "Loading Google…",
    saving: "Saving…",
    importing: "Importing…",
    minimumPassword: "Use an encryption password with at least 10 characters.",
    passwordsMismatch: "The two encryption passwords do not match.",
    passwordRequired: "Enter the encryption password for this backup.",
    confirmOneDriveExport: "Save this encrypted prompt backup to Microsoft OneDrive? The previous OneDrive prompt backup will be replaced. If General terms contains text, its separate backup will also be replaced; if empty, the previous General terms backup remains unchanged.",
    confirmGoogleDriveExport: "Save this encrypted prompt backup to Google Drive? The previous Google Drive prompt backup will be replaced. If General terms contains text, its separate backup will also be replaced; if empty, the previous General terms backup remains unchanged.",
    microsoftSignIn: "Waiting for Microsoft sign-in…",
    googleSignIn: "Waiting for Google sign-in…",
    encryptingAndSaving: "Encrypting and saving the prompt backup…",
    downloadingAndDecrypting: "Downloading and decrypting the prompt backup…",
    oneDriveSaved: "Encrypted prompt backup saved to Microsoft OneDrive. Any previous OneDrive prompt backup was replaced.",
    googleDriveSaved: "Encrypted prompt backup saved to Google Drive. Any previous Google Drive prompt backup was replaced.",
    oneDriveSavedWithGeneral: "Encrypted prompt and General terms backups saved to Microsoft OneDrive. Previous backups of those files were replaced.",
    googleDriveSavedWithGeneral: "Encrypted prompt and General terms backups saved to Google Drive. Previous backups of those files were replaced.",
    oneDriveImported: "Prompts imported from Microsoft OneDrive and saved in this browser.",
    googleDriveImported: "Prompts imported from Google Drive and saved in this browser.",
    oneDriveImportedWithGeneral: "Prompts and General terms imported from Microsoft OneDrive. General terms is available for this tab only.",
    googleDriveImportedWithGeneral: "Prompts and General terms imported from Google Drive. General terms is available for this tab only.",
    generalTermsImportWarning: "Prompts were imported, but the separate General terms backup could not be restored: {error}",
    jsonExported: "Prompt JSON export completed.",
    jsonImported: "Prompts imported from the JSON file and saved in this browser.",
    exportFailed: "Prompt export failed: {error}",
    importFailed: "Prompt import failed: {error}",
    invalidJson: "Prompt import failed: the file is not valid JSON.",
    replaceSaved: "Replace all 20 prompts and labels currently saved in this browser?",
    replaceGeneralTerms: "The available General terms backup will also replace General terms for this tab. Specific terms will not be changed.",
  },
  no: {
    close: "Lukk",
    exportTitle: "Eksporter prompter",
    importTitle: "Importer prompter",
    exportNotice: "Før eksport må alle promptene du ønsker å sikkerhetskopiere være ferdig utfylt. Alle de 20 lagrede promptplassene og navnene deres tas med; tomme plasser lagres som tomme. Ved skyeksport lagres også Generelle begreper som en separat kryptert kopi når feltet inneholder tekst. Spesifikke begreper tas aldri med.",
    importNotice: "Import erstatter alle 20 promptplassene og navnene som er lagret i denne nettleseren. En JSON- eller skysikkerhetskopi må være opprettet på forhånd. Skyimport gjenoppretter også en tilgjengelig kopi av Generelle begreper for denne fanen; Spesifikke begreper importeres aldri.",
    exportJson: "Eksporter som JSON-fil",
    importJson: "Importer fra JSON-fil",
    exportJsonHelp: "Bruker den eksisterende metoden og lagrer en lesbar JSON-fil på denne enheten. Oppbevar filen sikkert.",
    importJsonHelp: "Bruker den eksisterende metoden: velg en tidligere eksportert prompt-JSON-fil fra denne enheten.",
    exportOneDrive: "Eksporter til Microsoft OneDrive",
    importOneDrive: "Importer fra Microsoft OneDrive",
    exportOneDriveHelp: "Krypterer promptlisten som er lagret i nettleseren og lagrer én promptkopi i den private appmappen i Microsoft OneDrive. Hvis Generelle begreper inneholder tekst, krypteres og lagres dette som en separat kopi. Et tomt felt overskriver aldri en eldre kopi av Generelle begreper.",
    importOneDriveHelp: "Logg inn med samme private Microsoft-konto og skriv inn passordet. Prompter og en eventuell kopi av Generelle begreper hentes fra den private appmappen i OneDrive.",
    exportGoogleDrive: "Eksporter til Google Drive",
    importGoogleDrive: "Importer fra Google Drive",
    exportGoogleDriveHelp: "Krypterer promptlisten som er lagret i nettleseren og lagrer én promptkopi i det private appområdet i Google Drive. Hvis Generelle begreper inneholder tekst, krypteres og lagres dette som en separat kopi. Et tomt felt overskriver aldri en eldre kopi av Generelle begreper.",
    importGoogleDriveHelp: "Logg inn med samme Google-konto og skriv inn passordet. Prompter og en eventuell kopi av Generelle begreper hentes fra det private appområdet i Google Drive.",
    exportCloudNotice: "Opprett et Cloud Backup-passord for denne leverandøren. Det brukes for nøkler, promptlister og Workspace Sets, beholdes bare i denne faneøkten og lastes aldri opp. Hvis du glemmer det, kan sikkerhetskopien ikke gjenopprettes.",
    importCloudNotice: "Skriv inn Cloud Backup-passordet for denne leverandøren. Det beholdes bare i denne faneøkten og lastes aldri opp.",
    unlockedCloudNotice: "Det opplåste Cloud Backup-passordet for {provider} vil bli brukt.",
    legacyPasswordNotice: "Denne eldre promptkopien bruker et annet passord. Skriv inn det tidligere passordet for å importere den. Deretter kan den oppdateres til det felles Cloud Backup-passordet.",
    migrateLegacy: "Denne promptkopien brukte et eldre passord. Vil du oppdatere den nå til ditt nåværende Cloud Backup-passord?",
    newPassword: "Krypteringspassord (minst 10 tegn)",
    currentPassword: "Krypteringspassord",
    repeatPassword: "Gjenta passord",
    saveOneDrive: "Lagre i OneDrive",
    saveGoogleDrive: "Lagre i Google Drive",
    importOneDriveAction: "Importer fra OneDrive",
    importGoogleDriveAction: "Importer fra Google Drive",
    back: "Tilbake",
    loadingGoogle: "Laster Google…",
    saving: "Lagrer…",
    importing: "Importerer…",
    minimumPassword: "Bruk et krypteringspassord med minst 10 tegn.",
    passwordsMismatch: "De to krypteringspassordene er ikke like.",
    passwordRequired: "Skriv inn krypteringspassordet for sikkerhetskopien.",
    confirmOneDriveExport: "Lagre denne krypterte promptkopien i Microsoft OneDrive? Den forrige OneDrive-kopien av promptene erstattes. Hvis Generelle begreper inneholder tekst, erstattes også den separate kopien; hvis feltet er tomt, beholdes den forrige kopien uendret.",
    confirmGoogleDriveExport: "Lagre denne krypterte promptkopien i Google Drive? Den forrige Google Drive-kopien av promptene erstattes. Hvis Generelle begreper inneholder tekst, erstattes også den separate kopien; hvis feltet er tomt, beholdes den forrige kopien uendret.",
    microsoftSignIn: "Venter på Microsoft-innlogging…",
    googleSignIn: "Venter på Google-innlogging…",
    encryptingAndSaving: "Krypterer og lagrer promptkopien…",
    downloadingAndDecrypting: "Laster ned og dekrypterer promptkopien…",
    oneDriveSaved: "Kryptert promptkopi lagret i Microsoft OneDrive. En eventuell tidligere OneDrive-kopi ble erstattet.",
    googleDriveSaved: "Kryptert promptkopi lagret i Google Drive. En eventuell tidligere Google Drive-kopi ble erstattet.",
    oneDriveSavedWithGeneral: "Krypterte kopier av prompter og Generelle begreper ble lagret i Microsoft OneDrive. Tidligere kopier av disse filene ble erstattet.",
    googleDriveSavedWithGeneral: "Krypterte kopier av prompter og Generelle begreper ble lagret i Google Drive. Tidligere kopier av disse filene ble erstattet.",
    oneDriveImported: "Promptene ble importert fra Microsoft OneDrive og lagret i denne nettleseren.",
    googleDriveImported: "Promptene ble importert fra Google Drive og lagret i denne nettleseren.",
    oneDriveImportedWithGeneral: "Prompter og Generelle begreper ble importert fra Microsoft OneDrive. Generelle begreper er bare tilgjengelig i denne fanen.",
    googleDriveImportedWithGeneral: "Prompter og Generelle begreper ble importert fra Google Drive. Generelle begreper er bare tilgjengelig i denne fanen.",
    generalTermsImportWarning: "Promptene ble importert, men den separate kopien av Generelle begreper kunne ikke gjenopprettes: {error}",
    jsonExported: "Eksport av prompt-JSON er fullført.",
    jsonImported: "Promptene ble importert fra JSON-filen og lagret i denne nettleseren.",
    exportFailed: "Eksport av prompter mislyktes: {error}",
    importFailed: "Import av prompter mislyktes: {error}",
    invalidJson: "Import av prompter mislyktes: filen inneholder ikke gyldig JSON.",
    replaceSaved: "Erstatt alle 20 promptene og navnene som er lagret i denne nettleseren?",
    replaceGeneralTerms: "Den tilgjengelige kopien av Generelle begreper vil også erstatte innholdet i feltet for denne fanen. Spesifikke begreper endres ikke.",
  },
};

function getPromptBackupText() {
  let language = "en";
  try { language = localStorage.getItem("siteLanguage") || "en"; } catch {}
  return PROMPT_BACKUP_TEXT[language] || PROMPT_BACKUP_TEXT.en;
}

function formatPromptBackupText(template, values = {}) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

function getPromptOptionsForMiniPanel() {
  const slots = getAvailableSlots();
  const names = getSlotNames();

  return slots.map((slot) => {
    const explicit = getSlotDisplayName(slot, names);
    return {
      id: String(slot),
      label: explicit ? `${slot}. ${explicit}` : `${slot}.`,
      title: explicit || "",
    };
  });
}

function getCurrentPromptTitleForMiniPanel() {
  const slot = getCurrentSlot();
  const direct = String(promptSlotTriggerName?.textContent || "").trim();
  if (direct) return direct;

  const fallback = getSlotDisplayName(slot);
  if (fallback) return fallback;

  return "";
}

function syncMiniPanelPromptApi() {
  const app = (window.__app = window.__app || {});
  app.getMiniPanelPromptOptionsRich = () => getPromptOptionsForMiniPanel();
  app.getSelectedPromptSlotRich = () => getCurrentSlot();
  app.getCurrentPromptSlotTitleRich = () => getCurrentPromptTitleForMiniPanel();
}

function getAvailableSlots() {
  if (!promptSlotSelect) return [];
  return Array.from(promptSlotSelect.options)
    .map((opt) => String(opt.value || "").trim())
    .filter(Boolean);
}

function getCurrentSlot() {
  return String(promptSlotSelect?.value || getAvailableSlots()[0] || "1");
}

function getCurrentProfileId() {
  const profileId = (typeof PromptManager.getPromptProfileId === "function")
    ? String(PromptManager.getPromptProfileId() || "").trim()
    : "";
  return profileId || "";
}

function getEffectiveProfileId() {
  return getCurrentProfileId() || "default";
}

function getSlotNames() {
  if (typeof PromptManager.getSlotNames === "function") {
    return PromptManager.getSlotNames(getCurrentProfileId());
  }
  return {};
}

function getSlotDisplayName(slot, names = getSlotNames()) {
  const key = String(slot || "").trim();
  if (!key) return "";
  const explicit = (names && typeof names === "object") ? String(names[key] || "").trim() : "";
  if (explicit) return explicit;
  if (typeof PromptManager.getSlotDisplayName === "function") {
    return String(PromptManager.getSlotDisplayName(key, getCurrentProfileId()) || "").trim();
  }
  return "";
}

function emitMiniHubPromptUiRefresh(reason, extra = {}) {
  try {
    window.dispatchEvent(new CustomEvent(MINI_HUB_UI_REFRESH_EVENT, {
      detail: {
        reason: String(reason || "prompt-ui").trim() || "prompt-ui",
        profileId: getEffectiveProfileId(),
        slot: getCurrentSlot(),
        ...extra,
      },
    }));
  } catch {}
}

function persistCurrentSelectedSlot() {
  const slot = getCurrentSlot();
  if (typeof PromptManager.setSelectedPromptSlot === "function") {
    PromptManager.setSelectedPromptSlot(slot, getCurrentProfileId());
  }
  return slot;
}

function restorePersistedSelectedSlot() {
  if (!promptSlotSelect) return;
  const allowed = new Set(getAvailableSlots());
  let persisted = "";

  if (typeof PromptManager.getSelectedPromptSlot === "function") {
    persisted = String(PromptManager.getSelectedPromptSlot(getCurrentProfileId()) || "").trim();
  }

  if (!persisted || !allowed.has(persisted)) return;
  promptSlotSelect.value = persisted;
}

function reloadCurrentPromptSlot() {
  if (!promptSlotSelect || !customPromptTextarea) return;
  if (typeof PromptManager.loadPrompt === "function") {
    PromptManager.loadPrompt(promptSlotSelect.value);
  }
}

function setCurrentSlotValue(slot, { reload = true, emitChange = true } = {}) {
  if (!promptSlotSelect) return;
  const next = String(slot || "").trim();
  if (!next) return;

  const allowed = new Set(getAvailableSlots());
  if (!allowed.has(next)) return;

  if (promptSlotSelect.value !== next) {
    promptSlotSelect.value = next;
  }

  persistCurrentSelectedSlot();

  if (reload) {
    reloadCurrentPromptSlot();
    syncNameInputForCurrentSlot();
    renderPromptSlotTrigger();
    renderPromptSlotPopover();
    syncMiniPanelPromptApi();
    emitMiniHubPromptUiRefresh("slot-value-set", { slot: next, reload: true });
  }

  if (emitChange) {
    promptSlotSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function renderPromptSlotTrigger() {
  if (!promptSlotTrigger || !promptSlotTriggerSlot || !promptSlotTriggerName) return;
  const slot = getCurrentSlot();
  promptSlotTriggerSlot.textContent = `${slot}.`;

  const name = getSlotDisplayName(slot);
  if (name) {
    promptSlotTriggerName.textContent = name;
    promptSlotTrigger.title = `Slot ${slot}: ${name}`;
    syncMiniPanelPromptApi();
    return;
  }

  promptSlotTriggerName.textContent = "";
  promptSlotTrigger.title = `Slot ${slot}`;
  syncMiniPanelPromptApi();
}

function clearDragOverState() {
  if (!promptSlotList) return;
  promptSlotList.querySelectorAll(".prompt-slot-item.is-drag-over").forEach((el) => {
    el.classList.remove("is-drag-over");
  });
  promptSlotList.querySelectorAll(".prompt-slot-item.is-dragging").forEach((el) => {
    el.classList.remove("is-dragging");
  });
}

let dragIntentSlot = "";
let dragSourceSlot = "";

function buildPromptSlotItem(slot, names, activeSlot) {
  const isActive = String(slot) === String(activeSlot);
  const row = document.createElement("div");
  row.className = `prompt-slot-item${isActive ? " is-active" : ""}`;
  row.dataset.slot = String(slot);
  row.setAttribute("role", "option");
  row.setAttribute("aria-selected", isActive ? "true" : "false");
  row.draggable = true;

  const selectButton = document.createElement("button");
  selectButton.type = "button";
  selectButton.className = "prompt-slot-item-button";
  selectButton.dataset.slot = String(slot);
  selectButton.setAttribute("aria-label", `Select slot ${slot}`);

  const title = document.createElement("span");
  title.className = "prompt-slot-item-title";

  const badge = document.createElement("span");
  badge.className = "prompt-slot-badge";
  badge.textContent = `${slot}.`;

  const name = document.createElement("span");
  name.className = "prompt-slot-item-name";
  name.textContent = getSlotDisplayName(slot, names);

  title.appendChild(badge);
  title.appendChild(name);
  selectButton.appendChild(title);

  const dragHandle = document.createElement("button");
  dragHandle.type = "button";
  dragHandle.className = "prompt-slot-drag-handle";
  dragHandle.dataset.slot = String(slot);
  dragHandle.dataset.slotDragHandle = "true";
  dragHandle.setAttribute("aria-label", `Drag slot ${slot} to reorder`);
  dragHandle.title = "Drag to reorder";
  dragHandle.textContent = "⋮⋮";

  dragHandle.addEventListener("pointerdown", () => {
    dragIntentSlot = String(slot);
  });

  dragHandle.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      dragIntentSlot = String(slot);
    }
  });

  row.appendChild(selectButton);
  row.appendChild(dragHandle);

  selectButton.addEventListener("click", () => {
    setCurrentSlotValue(slot);
    closePromptSlotPopover();
    promptSlotTrigger?.focus();
  });

  row.addEventListener("dragstart", (e) => {
    if (dragIntentSlot !== String(slot)) {
      e.preventDefault();
      return;
    }
    dragSourceSlot = String(slot);
    row.classList.add("is-dragging");
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(slot));
    }
  });

  row.addEventListener("dragover", (e) => {
    if (!dragSourceSlot || dragSourceSlot === String(slot)) return;
    e.preventDefault();
    row.classList.add("is-drag-over");
  });

  row.addEventListener("dragleave", () => {
    row.classList.remove("is-drag-over");
  });

  row.addEventListener("drop", async (e) => {
    e.preventDefault();
    row.classList.remove("is-drag-over");

    const from = dragSourceSlot;
    const to = String(slot);
    dragSourceSlot = "";
    dragIntentSlot = "";
    clearDragOverState();

    if (!from || !to || from === to) return;

    try {
      let finalSlot = null;
      if (typeof PromptManager.reorderPromptSlots === "function") {
        finalSlot = PromptManager.reorderPromptSlots(from, to);
      }

      if (!finalSlot) {
        console.warn("Prompt slot reorder was not applied.");
        return;
      }

      const current = getCurrentSlot();
      if (String(current) === String(from)) {
        promptSlotSelect.value = String(finalSlot);
      } else if (String(current) === String(to)) {
        promptSlotSelect.value = String(from);
      }

      persistCurrentSelectedSlot();
      reloadCurrentPromptSlot();
      syncNameInputForCurrentSlot();
      renderPromptSlotTrigger();
      renderPromptSlotPopover();
      syncMiniPanelPromptApi();
    } catch (err) {
      console.warn("Prompt slot reorder failed:", err);
    }
  });

  row.addEventListener("dragend", () => {
    dragSourceSlot = "";
    dragIntentSlot = "";
    clearDragOverState();
  });

  return row;
}

function renderPromptSlotPopover() {
  if (!promptSlotList) return;
  const names = getSlotNames();
  const activeSlot = getCurrentSlot();

  promptSlotList.innerHTML = "";
  getAvailableSlots().forEach((slot) => {
    promptSlotList.appendChild(buildPromptSlotItem(slot, names, activeSlot));
  });
  syncMiniPanelPromptApi();
}

function updatePromptSlotPopoverPlacement() {
  if (!promptSlotPopover || !promptSlotTrigger || promptSlotPopover.hidden) return;

  promptSlotPopover.classList.remove("opens-up");

  const triggerRect = promptSlotTrigger.getBoundingClientRect();
  const popoverRect = promptSlotPopover.getBoundingClientRect();
  const margin = 12;
  const spaceBelow = window.innerHeight - triggerRect.bottom - margin;
  const spaceAbove = triggerRect.top - margin;
  const needsUpward = spaceBelow < popoverRect.height && spaceAbove > spaceBelow;

  promptSlotPopover.classList.toggle("opens-up", needsUpward);
}

function openPromptSlotPopover() {
  if (!promptSlotPopover || !promptSlotPicker || !promptSlotTrigger) return;
  renderPromptSlotPopover();
  renderPromptSlotTrigger();
  promptSlotPopover.hidden = false;
  promptSlotPicker.classList.add("is-open");
  promptSlotTrigger.setAttribute("aria-expanded", "true");
  updatePromptSlotPopoverPlacement();
}

function closePromptSlotPopover() {
  if (!promptSlotPopover || !promptSlotPicker || !promptSlotTrigger) return;
  promptSlotPopover.hidden = true;
  promptSlotPicker.classList.remove("is-open");
  promptSlotTrigger.setAttribute("aria-expanded", "false");
  clearDragOverState();
  dragIntentSlot = "";
  dragSourceSlot = "";
}

function togglePromptSlotPopover() {
  if (!promptSlotPopover) return;
  if (promptSlotPopover.hidden) openPromptSlotPopover();
  else closePromptSlotPopover();
}

function syncNameInputForCurrentSlot() {
  if (!promptSlotSelect || !promptSlotNameInput) return;
  const slot = String(promptSlotSelect.value || "");
  promptSlotNameInput.value = getSlotDisplayName(slot);
}

const promptBackupModalState = {
  mode: "export",
  provider: "",
  busy: false,
  legacyPasswordMode: false,
};

function setPromptBackupStatus(message, isError = false, { modalOnly = false } = {}) {
  const color = isError ? "#b00020" : "#2e7d32";
  if (promptBackupModal.status) {
    promptBackupModal.status.textContent = String(message || "");
    promptBackupModal.status.style.color = color;
  }
  if (!modalOnly && promptBackupStatus) {
    promptBackupStatus.textContent = String(message || "");
    promptBackupStatus.style.color = color;
  }
}

function setPromptBackupBusy(busy, label = "") {
  promptBackupModalState.busy = Boolean(busy);
  if (promptBackupModal.cloudAction) {
    promptBackupModal.cloudAction.disabled = Boolean(busy);
    if (label) promptBackupModal.cloudAction.textContent = label;
  }
  if (promptBackupModal.cloudBack) promptBackupModal.cloudBack.disabled = Boolean(busy);
  if (promptBackupModal.close) promptBackupModal.close.disabled = Boolean(busy);
}

function clearPromptBackupPasswords() {
  if (promptBackupModal.password) promptBackupModal.password.value = "";
  if (promptBackupModal.passwordConfirm) promptBackupModal.passwordConfirm.value = "";
}

function updatePromptBackupChoiceText() {
  const text = getPromptBackupText();
  const isExport = promptBackupModalState.mode === "export";
  if (promptBackupModal.title) {
    promptBackupModal.title.textContent = isExport ? text.exportTitle : text.importTitle;
  }
  if (promptBackupModal.close) promptBackupModal.close.setAttribute("aria-label", text.close);
  if (promptBackupModal.choiceNotice) {
    promptBackupModal.choiceNotice.textContent = isExport ? text.exportNotice : text.importNotice;
  }
  if (promptBackupModal.jsonChoice) {
    promptBackupModal.jsonChoice.textContent = isExport ? text.exportJson : text.importJson;
  }
  if (promptBackupModal.jsonHelp) {
    promptBackupModal.jsonHelp.textContent = isExport ? text.exportJsonHelp : text.importJsonHelp;
  }
  if (promptBackupModal.oneDriveChoice) {
    promptBackupModal.oneDriveChoice.textContent = isExport ? text.exportOneDrive : text.importOneDrive;
  }
  if (promptBackupModal.oneDriveHelp) {
    promptBackupModal.oneDriveHelp.textContent = isExport
      ? text.exportOneDriveHelp
      : text.importOneDriveHelp;
  }
  if (promptBackupModal.googleDriveChoice) {
    promptBackupModal.googleDriveChoice.textContent = isExport
      ? text.exportGoogleDrive
      : text.importGoogleDrive;
  }
  if (promptBackupModal.googleDriveHelp) {
    promptBackupModal.googleDriveHelp.textContent = isExport
      ? text.exportGoogleDriveHelp
      : text.importGoogleDriveHelp;
  }
  if (promptBackupModal.cloudBack) promptBackupModal.cloudBack.textContent = text.back;
}

function showPromptBackupChoiceStep() {
  promptBackupModalState.provider = "";
  promptBackupModalState.legacyPasswordMode = false;
  setPromptBackupBusy(false);
  clearPromptBackupPasswords();
  updatePromptBackupChoiceText();
  if (promptBackupModal.choiceStep) promptBackupModal.choiceStep.style.display = "";
  if (promptBackupModal.cloudStep) promptBackupModal.cloudStep.style.display = "none";
  setPromptBackupStatus("", false, { modalOnly: true });
  promptBackupModal.jsonChoice?.focus();
}

function getPromptBackupActionLabel() {
  const text = getPromptBackupText();
  const isExport = promptBackupModalState.mode === "export";
  if (promptBackupModalState.provider === "oneDrive") {
    return isExport ? text.saveOneDrive : text.importOneDriveAction;
  }
  return isExport ? text.saveGoogleDrive : text.importGoogleDriveAction;
}

async function showPromptBackupCloudStep(provider) {
  promptBackupModalState.provider = provider;
  const text = getPromptBackupText();
  const isExport = promptBackupModalState.mode === "export";
  const unlockedPassword = CloudBackupSession.getPassword(provider);
  const useUnlockedPassword = Boolean(unlockedPassword) && !promptBackupModalState.legacyPasswordMode;
  const providerName = provider === "oneDrive" ? "Microsoft OneDrive" : "Google Drive";

  if (promptBackupModal.choiceStep) promptBackupModal.choiceStep.style.display = "none";
  if (promptBackupModal.cloudStep) promptBackupModal.cloudStep.style.display = "";
  if (promptBackupModal.cloudNotice) {
    promptBackupModal.cloudNotice.textContent = promptBackupModalState.legacyPasswordMode
      ? text.legacyPasswordNotice
      : useUnlockedPassword
        ? formatPromptBackupText(text.unlockedCloudNotice, { provider: providerName })
        : isExport ? text.exportCloudNotice : text.importCloudNotice;
  }
  if (promptBackupModal.passwordLabel) {
    promptBackupModal.passwordLabel.textContent = isExport ? text.newPassword : text.currentPassword;
  }
  if (promptBackupModal.passwordConfirmLabel) {
    promptBackupModal.passwordConfirmLabel.textContent = text.repeatPassword;
  }
  if (promptBackupModal.passwordConfirmWrap) {
    promptBackupModal.passwordConfirmWrap.style.display = isExport && !useUnlockedPassword ? "" : "none";
  }
  if (promptBackupModal.password) {
    promptBackupModal.password.setAttribute("autocomplete", isExport ? "new-password" : "current-password");
    promptBackupModal.password.style.display = useUnlockedPassword ? "none" : "";
  }
  if (promptBackupModal.passwordLabel) {
    promptBackupModal.passwordLabel.style.display = useUnlockedPassword ? "none" : "";
  }
  if (promptBackupModal.cloudAction) {
    promptBackupModal.cloudAction.textContent = getPromptBackupActionLabel();
  }
  clearPromptBackupPasswords();
  setPromptBackupStatus("", false, { modalOnly: true });

  if (provider === "googleDrive") {
    setPromptBackupBusy(true, text.loadingGoogle);
    try {
      await PromptCloudBackup.prepareGoogleSignIn();
      setPromptBackupBusy(false, getPromptBackupActionLabel());
      if (useUnlockedPassword) promptBackupModal.cloudAction?.focus();
      else promptBackupModal.password?.focus();
    } catch (error) {
      setPromptBackupBusy(false, getPromptBackupActionLabel());
      setPromptBackupStatus(error?.message || "Google sign-in could not be loaded.", true, {
        modalOnly: true,
      });
    }
    return;
  }

  if (useUnlockedPassword) promptBackupModal.cloudAction?.focus();
  else promptBackupModal.password?.focus();
}

function openPromptBackupModal(mode) {
  if (!promptBackupModal.backdrop) return;
  promptBackupModalState.mode = mode === "import" ? "import" : "export";
  promptBackupModalState.busy = false;
  promptBackupModalState.legacyPasswordMode = false;
  setPromptBackupStatus("");
  showPromptBackupChoiceStep();
  promptBackupModal.backdrop.classList.add("active");
  promptBackupModal.backdrop.setAttribute("aria-hidden", "false");
  promptBackupModal.jsonChoice?.focus();
}

function closePromptBackupModal({ force = false } = {}) {
  if (!promptBackupModal.backdrop || (promptBackupModalState.busy && !force)) return;
  clearPromptBackupPasswords();
  promptBackupModal.backdrop.classList.remove("active");
  promptBackupModal.backdrop.setAttribute("aria-hidden", "true");
  if (promptBackupModal.status) promptBackupModal.status.textContent = "";
  const returnFocus = promptBackupModalState.mode === "export" ? promptExportBtn : promptImportBtn;
  returnFocus?.focus();
}

function normalizeGeneralTermsText(value) {
  return String(value || "").replace(/\r\n?/g, "\n").trim();
}

function getCurrentGeneralTerms() {
  return normalizeGeneralTermsText(redactorGeneralTerms?.value || "");
}

function buildGeneralTermsExportBundle() {
  const generalTerms = getCurrentGeneralTerms();
  if (!generalTerms) return null;
  return {
    schema: "whisper.redactor-general-terms",
    version: 1,
    exportedAt: new Date().toISOString(),
    generalTerms,
  };
}

function applyGeneralTermsImportBundle(bundle) {
  if (!bundle || bundle.schema !== "whisper.redactor-general-terms" ||
      bundle.version !== 1 || typeof bundle.generalTerms !== "string") {
    throw new Error("The General terms backup has an unsupported format.");
  }

  const generalTerms = normalizeGeneralTermsText(bundle.generalTerms);
  if (!generalTerms || !redactorGeneralTerms) return false;

  redactorGeneralTerms.value = generalTerms;
  redactorGeneralTerms.dispatchEvent(new Event("input", { bubbles: true }));
  try {
    sessionStorage.setItem("redactor_general_terms_session", generalTerms);
  } catch {}
  return true;
}

function buildPromptImportConfirmation(bundle, { includesGeneralTerms = false } = {}) {
  const text = getPromptBackupText();
  PromptManager.validatePromptImportBundle(bundle);
  let message = text.replaceSaved;

  if (includesGeneralTerms) {
    message += `\n\n${text.replaceGeneralTerms}`;
  }
  return message;
}

function importPromptBundleWithConfirmation(bundle, options = {}) {
  const confirmMessage = buildPromptImportConfirmation(bundle, options);
  return PromptManager.importPromptsFromBundle(bundle, { confirmMessage });
}

function refreshPromptUiAfterImport() {
  reloadCurrentPromptSlot();
  renderPromptSlotTrigger();
  renderPromptSlotPopover();
  syncNameInputForCurrentSlot();
  syncMiniPanelPromptApi();
  emitMiniHubPromptUiRefresh("prompt-slots-imported", { imported: true });
}

async function runPromptCloudAction() {
  if (promptBackupModalState.busy) return;
  const text = getPromptBackupText();
  const isExport = promptBackupModalState.mode === "export";
  const provider = promptBackupModalState.provider;
  const unlockedPassword = CloudBackupSession.getPassword(provider);
  const usingUnlockedPassword = Boolean(unlockedPassword) && !promptBackupModalState.legacyPasswordMode;
  const password = usingUnlockedPassword
    ? unlockedPassword
    : String(promptBackupModal.password?.value || "");
  const confirmation = String(promptBackupModal.passwordConfirm?.value || "");

  if (isExport && !usingUnlockedPassword && password.length < 10) {
    setPromptBackupStatus(text.minimumPassword, true, { modalOnly: true });
    promptBackupModal.password?.focus();
    return;
  }
  if (isExport && !usingUnlockedPassword && password !== confirmation) {
    setPromptBackupStatus(text.passwordsMismatch, true, { modalOnly: true });
    promptBackupModal.passwordConfirm?.focus();
    return;
  }
  if (!isExport && !password) {
    setPromptBackupStatus(text.passwordRequired, true, { modalOnly: true });
    promptBackupModal.password?.focus();
    return;
  }

  if (isExport) {
    const confirmText = provider === "oneDrive"
      ? text.confirmOneDriveExport
      : text.confirmGoogleDriveExport;
    if (!window.confirm(confirmText)) return;
  }

  let succeeded = false;
  let generalTermsSaved = false;
  let generalTermsImported = false;
  let generalTermsImportError = null;
  let migratedLegacyBackup = false;
  const busyLabel = isExport ? text.saving : text.importing;
  setPromptBackupBusy(true, busyLabel);
  setPromptBackupStatus("", false, { modalOnly: true });

  try {
    const updateProgress = (statusKey) => {
      setPromptBackupStatus(text[statusKey] || statusKey, false, { modalOnly: true });
    };

    const accessToken = await PromptCloudBackup.connect(provider, updateProgress);

    if (isExport) {
      const promptBundle = PromptManager.buildPromptExportBundle();
      const generalTermsBundle = buildGeneralTermsExportBundle();
      updateProgress("encryptingAndSaving");
      const result = await PromptCloudBackup.savePackageWithAccessToken(
        provider,
        accessToken,
        { promptBundle, generalTermsBundle },
        password
      );
      generalTermsSaved = Boolean(result?.generalTermsSaved);
      CloudBackupSession.unlock(provider, password);
      succeeded = true;
    } else {
      updateProgress("downloadingAndDecrypting");
      const result = await PromptCloudBackup.loadPackageWithAccessToken(
        provider,
        accessToken,
        password
      );
      const imported = importPromptBundleWithConfirmation(result.promptBundle, {
        includesGeneralTerms: Boolean(result.generalTermsBundle),
      });
      if (!imported) return;

      if (result.generalTermsBundle) {
        try {
          generalTermsImported = applyGeneralTermsImportBundle(result.generalTermsBundle);
        } catch (error) {
          generalTermsImportError = error;
        }
      }
      if (result.generalTermsError) {
        generalTermsImportError = result.generalTermsError;
      }
      refreshPromptUiAfterImport();
      if (!unlockedPassword) {
        CloudBackupSession.unlock(provider, password);
      } else if (promptBackupModalState.legacyPasswordMode &&
                 window.confirm(text.migrateLegacy)) {
        updateProgress("encryptingAndSaving");
        await PromptCloudBackup.savePackageWithAccessToken(
          provider,
          accessToken,
          {
            promptBundle: result.promptBundle,
            generalTermsBundle: result.generalTermsBundle,
          },
          unlockedPassword
        );
        migratedLegacyBackup = true;
      }
      succeeded = true;
    }
  } catch (error) {
    if (!isExport && usingUnlockedPassword &&
        /incorrect password|damaged/i.test(String(error?.message || ""))) {
      promptBackupModalState.legacyPasswordMode = true;
      clearPromptBackupPasswords();
      if (promptBackupModal.cloudNotice) {
        promptBackupModal.cloudNotice.textContent = text.legacyPasswordNotice;
      }
      if (promptBackupModal.passwordLabel) promptBackupModal.passwordLabel.style.display = "";
      if (promptBackupModal.password) promptBackupModal.password.style.display = "";
      if (promptBackupModal.passwordConfirmWrap) promptBackupModal.passwordConfirmWrap.style.display = "none";
      setPromptBackupStatus(text.legacyPasswordNotice, true, { modalOnly: true });
      promptBackupModal.password?.focus();
      return;
    }
    const template = isExport ? text.exportFailed : text.importFailed;
    setPromptBackupStatus(formatPromptBackupText(template, {
      error: error?.message || "Unknown error",
    }), true, { modalOnly: true });
  } finally {
    clearPromptBackupPasswords();
    setPromptBackupBusy(false, getPromptBackupActionLabel());
  }

  if (!succeeded) return;

  let successMessage;
  if (isExport) {
    successMessage = provider === "oneDrive"
      ? (generalTermsSaved ? text.oneDriveSavedWithGeneral : text.oneDriveSaved)
      : (generalTermsSaved ? text.googleDriveSavedWithGeneral : text.googleDriveSaved);
  } else {
    successMessage = provider === "oneDrive"
      ? (generalTermsImported ? text.oneDriveImportedWithGeneral : text.oneDriveImported)
      : (generalTermsImported ? text.googleDriveImportedWithGeneral : text.googleDriveImported);
  }
  if (migratedLegacyBackup) successMessage += " The cloud backup password was updated.";
  closePromptBackupModal({ force: true });
  if (generalTermsImportError) {
    setPromptBackupStatus(formatPromptBackupText(text.generalTermsImportWarning, {
      error: generalTermsImportError?.message || "Unknown error",
    }), true);
  } else {
    setPromptBackupStatus(successMessage, false);
  }
}

restorePersistedSelectedSlot();
renderPromptSlotTrigger();
renderPromptSlotPopover();
syncNameInputForCurrentSlot();
closePromptSlotPopover();

if (promptSlotTrigger) {
  promptSlotTrigger.addEventListener("click", () => {
    togglePromptSlotPopover();
  });
}

document.addEventListener("pointerdown", (e) => {
  if (!promptSlotPicker || !promptSlotPopover || promptSlotPopover.hidden) return;
  if (promptSlotPicker.contains(e.target)) return;
  closePromptSlotPopover();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && promptSlotPopover && !promptSlotPopover.hidden) {
    closePromptSlotPopover();
    promptSlotTrigger?.focus();
  }
});

window.addEventListener("resize", () => {
  if (promptSlotPopover && !promptSlotPopover.hidden) {
    updatePromptSlotPopoverPlacement();
  }
});

window.addEventListener("scroll", () => {
  if (promptSlotPopover && !promptSlotPopover.hidden) {
    updatePromptSlotPopoverPlacement();
  }
}, true);

if (promptSlotSelect && customPromptTextarea) {
  let isLoadingPrompt = false;

  function loadCurrentSlot() {
    persistCurrentSelectedSlot();
    isLoadingPrompt = true;
    PromptManager.loadPrompt(promptSlotSelect.value);
    isLoadingPrompt = false;
    syncNameInputForCurrentSlot();
    renderPromptSlotTrigger();
    renderPromptSlotPopover();
    syncMiniPanelPromptApi();
  }

  loadCurrentSlot();

  customPromptTextarea.addEventListener("input", () => {
    if (isLoadingPrompt) return;
    const value = window.__getVisibleCustomPromptValue
      ? window.__getVisibleCustomPromptValue()
      : customPromptTextarea.value;
    PromptManager.savePrompt(promptSlotSelect.value, value);
    customPromptTextarea.style.height = "auto";
    customPromptTextarea.style.height = `${customPromptTextarea.scrollHeight}px`;
  });

  promptSlotSelect.addEventListener("change", loadCurrentSlot);
}

if (promptSlotNameInput && promptSlotSelect) {
  const commitName = () => {
    const slot = String(promptSlotSelect.value || "");
    const name = String(promptSlotNameInput.value || "").trim();
    if (typeof PromptManager.setSlotDisplayName === "function") {
      PromptManager.setSlotDisplayName(slot, name, getCurrentProfileId());
    }
    renderPromptSlotTrigger();
    renderPromptSlotPopover();
    syncMiniPanelPromptApi();
  };

  promptSlotNameInput.addEventListener("blur", commitName);
  promptSlotNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      promptSlotNameInput.blur();
    }
  });
}

if (clearPromptButton && promptSlotSelect && customPromptTextarea) {
  clearPromptButton.addEventListener("click", () => {
    customPromptTextarea.value = "";
    PromptManager.savePrompt(promptSlotSelect.value, "");
    customPromptTextarea.style.height = "auto";
    customPromptTextarea.style.height = `${customPromptTextarea.scrollHeight}px`;
  });
}

if (copyPromptButton && customPromptTextarea) {
  const originalLabel = copyPromptButton.textContent;
  copyPromptButton.addEventListener("click", async () => {
    const text = window.__getVisibleCustomPromptValue
      ? window.__getVisibleCustomPromptValue()
      : customPromptTextarea.value;

    try {
      await navigator.clipboard.writeText(text || "");
      copyPromptButton.textContent = "Copied";
      setTimeout(() => { copyPromptButton.textContent = originalLabel; }, 1200);
    } catch (err) {
      try {
        customPromptTextarea.focus();
        customPromptTextarea.select();
        document.execCommand("copy");
        copyPromptButton.textContent = "Copied";
        setTimeout(() => { copyPromptButton.textContent = originalLabel; }, 1200);
      } catch (_) {
        console.warn("Copy failed", err);
      } finally {
        try { window.getSelection()?.removeAllRanges?.(); } catch (_) {}
      }
    }
  });
}

if (promptExportBtn) {
  promptExportBtn.addEventListener("click", () => {
    openPromptBackupModal("export");
  });
}

if (promptImportBtn && promptImportFile) {
  promptImportBtn.addEventListener("click", () => {
    openPromptBackupModal("import");
  });

  promptImportFile.addEventListener("change", async () => {
    const text = getPromptBackupText();
    const file = promptImportFile.files && promptImportFile.files[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const bundle = JSON.parse(raw);
      const imported = importPromptBundleWithConfirmation(bundle);
      if (!imported) return;
      refreshPromptUiAfterImport();
      setPromptBackupStatus(text.jsonImported, false);
    } catch (error) {
      const message = error instanceof SyntaxError
        ? text.invalidJson
        : formatPromptBackupText(text.importFailed, {
            error: error?.message || "Unknown error",
          });
      setPromptBackupStatus(message, true);
    }
  });
}

promptBackupModal.close?.addEventListener("click", () => closePromptBackupModal());
promptBackupModal.cloudBack?.addEventListener("click", showPromptBackupChoiceStep);
promptBackupModal.oneDriveChoice?.addEventListener("click", () => {
  showPromptBackupCloudStep("oneDrive");
});
promptBackupModal.googleDriveChoice?.addEventListener("click", () => {
  showPromptBackupCloudStep("googleDrive");
});
promptBackupModal.cloudAction?.addEventListener("click", runPromptCloudAction);

promptBackupModal.jsonChoice?.addEventListener("click", async () => {
  const text = getPromptBackupText();
  if (promptBackupModalState.mode === "import") {
    closePromptBackupModal({ force: true });
    promptImportFile.value = "";
    promptImportFile.click();
    return;
  }

  closePromptBackupModal({ force: true });
  try {
    const exported = await PromptManager.exportPromptsToFile();
    if (exported) setPromptBackupStatus(text.jsonExported, false);
  } catch (error) {
    if (error?.name === "AbortError") return;
    setPromptBackupStatus(formatPromptBackupText(text.exportFailed, {
      error: error?.message || "Unknown error",
    }), true);
  }
});

promptBackupModal.backdrop?.addEventListener("click", (event) => {
  if (event.target === promptBackupModal.backdrop) closePromptBackupModal();
});

[promptBackupModal.password, promptBackupModal.passwordConfirm].forEach((input) => {
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runPromptCloudAction();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && promptBackupModal.backdrop?.classList.contains("active")) {
    closePromptBackupModal();
  }
});

window.addEventListener("transcribe-language-updated", () => {
  if (promptBackupModal.backdrop?.classList.contains("active")) {
    updatePromptBackupChoiceText();
    if (promptBackupModalState.provider && promptBackupModal.cloudStep?.style.display !== "none") {
      showPromptBackupCloudStep(promptBackupModalState.provider);
    }
  }
});

window.addEventListener("prompt-profile-changed", (event) => {
  const detail = event?.detail || {};
  const nextProfileId = String(detail.profileId || detail.effectiveProfileId || "").trim();
  const currentProfileId = getEffectiveProfileId();
  if (nextProfileId && nextProfileId !== currentProfileId) return;

  restorePersistedSelectedSlot();
  reloadCurrentPromptSlot();
  syncNameInputForCurrentSlot();
  renderPromptSlotTrigger();
  renderPromptSlotPopover();
  syncMiniPanelPromptApi();
  emitMiniHubPromptUiRefresh("prompt-profile-changed", {
    profileId: currentProfileId,
  });
});

window.addEventListener("prompt-slot-selection-changed", (event) => {
  if (!promptSlotSelect) return;
  const detail = event?.detail || {};
  const eventProfileId = String(detail.profileId || "").trim();
  if (eventProfileId && eventProfileId !== getEffectiveProfileId()) return;

  const slot = String(detail.slot || "").trim();
  const allowed = new Set(getAvailableSlots());
  if (!slot || !allowed.has(slot) || promptSlotSelect.value === slot) return;

  promptSlotSelect.value = slot;
  reloadCurrentPromptSlot();
  syncNameInputForCurrentSlot();
  renderPromptSlotTrigger();
  renderPromptSlotPopover();
  syncMiniPanelPromptApi();
  emitMiniHubPromptUiRefresh("prompt-slot-selection-changed", { slot });
});

window.addEventListener("prompt-slot-names-changed", (event) => {
  const detail = event?.detail || {};
  const eventProfileId = String(detail.profileId || "").trim();
  if (eventProfileId && eventProfileId !== getEffectiveProfileId()) return;

  syncNameInputForCurrentSlot();
  renderPromptSlotTrigger();
  renderPromptSlotPopover();
  syncMiniPanelPromptApi();
  emitMiniHubPromptUiRefresh("prompt-slot-names-changed");
});

window.addEventListener("prompt-slots-imported", (event) => {
  const detail = event?.detail || {};
  const eventProfileId = String(detail.profileId || "").trim();
  if (eventProfileId && eventProfileId !== getEffectiveProfileId()) return;

  reloadCurrentPromptSlot();
  syncNameInputForCurrentSlot();
  renderPromptSlotTrigger();
  renderPromptSlotPopover();
  syncMiniPanelPromptApi();
  emitMiniHubPromptUiRefresh("prompt-slots-imported");
});

window.addEventListener("prompt-slots-reordered", (event) => {
  const detail = event?.detail || {};
  const eventProfileId = String(detail.profileId || "").trim();
  if (eventProfileId && eventProfileId !== getEffectiveProfileId()) return;

  syncNameInputForCurrentSlot();
  renderPromptSlotTrigger();
  renderPromptSlotPopover();
  syncMiniPanelPromptApi();
  emitMiniHubPromptUiRefresh("prompt-slots-reordered");
});

syncMiniPanelPromptApi();
