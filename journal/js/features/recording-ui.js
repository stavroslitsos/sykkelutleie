import { registerWorkspaceDisposer } from "../core/workspace-disposal.js";

(function initRecordingUiFeature() {
  if (window.__recordingUiFeatureInitialized) return;
  window.__recordingUiFeatureInitialized = true;

  initRecordingTimerUi();
  initProviderLockWhileRecording();
})();

function getRecordingUiApp() {
  return window.__app || null;
}

function getRecordingUiBusyState() {
  const app = getRecordingUiApp();
  if (app && typeof app.isTranscribeBusy === "function") {
    try {
      return !!app.isTranscribeBusy();
    } catch (_) {}
  }

  const stopBtn = document.getElementById("stopButton");
  if (stopBtn && stopBtn.disabled === false) return true;

  const status = (document.getElementById("statusMessage")?.innerText || "").trim();
  if (!status) return false;
  if (/finishing transcription/i.test(status)) return true;
  if (/(transcribing|processing|uploading)/i.test(status) && !/transcription finished/i.test(status)) {
    return true;
  }

  return false;
}

function initRecordingTimerUi() {
  if (window.__recordTimerControllerInitialized) return;
  window.__recordTimerControllerInitialized = true;
  const timerEl = document.getElementById("recordTimer");
  if (!timerEl) return;
  let elapsed = 0, started = 0;
  function render() {
    const sec = Math.floor((elapsed + (started ? Date.now() - started : 0)) / 1000);
    timerEl.textContent = "Recording Timer: " + (sec < 60 ? sec + " sec" : Math.floor(sec / 60) + " min " + (sec % 60) + " sec");
  }
  function freeze() { if (started) elapsed += Date.now() - started; started = 0; }
  window.addEventListener("recording:lifecycle", ({ detail }) => {
    if (detail.phase === "starting" || detail.phase === "aborted" || detail.phase === "idle") {
      elapsed = 0; started = 0;
      if (detail.phase === "starting") document.getElementById("transcription")?.style.removeProperty("height");
    }
    else if (detail.phase === "recording") { if (!started) started = Date.now(); }
    else if (["paused", "stopping", "stopped", "error"].includes(detail.phase)) freeze();
    render();
  });
  render();
  const timer = setInterval(render, 1000);
  registerWorkspaceDisposer(() => clearInterval(timer), { scope: "window" });
}

function initProviderLockWhileRecording() {
  let lastLocked = null;

  function setLocked(locked) {
    const providerSel = document.getElementById("transcribeProvider");
    const speakerLabelSel = document.getElementById("sonioxSpeakerLabels");
    const regionSel = document.getElementById("sonioxRegion");

    if (providerSel) providerSel.disabled = !!locked;
    if (speakerLabelSel) speakerLabelSel.disabled = !!locked;
    if (regionSel) regionSel.disabled = !!locked;
  }

  function syncLockedState() {
    const locked = getRecordingUiBusyState();

    if (locked !== lastLocked) {
      setLocked(locked);
      lastLocked = locked;
    }
  }

  syncLockedState();

  document.addEventListener("click", (event) => {
    const id = event.target && event.target.id;
    if (
      id === "startButton" ||
      id === "stopButton" ||
      id === "pauseResumeButton" ||
      id === "abortButton"
    ) {
      setTimeout(syncLockedState, 0);
      setTimeout(syncLockedState, 150);
    }
  }, true);

  window.addEventListener("transcription:finished", syncLockedState);

  // Keep a light polling fallback because main.js can replace buttons and
  // provider engines can update busy state asynchronously.
  const lockTimer = setInterval(syncLockedState, 200);
  registerWorkspaceDisposer(() => clearInterval(lockTimer), { scope: "window" });
}
