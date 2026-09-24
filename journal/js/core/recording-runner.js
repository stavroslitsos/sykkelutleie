// js/core/recording-runner.js
// Shared helpers for recording/transcription modules.
// This keeps DOM/control wiring and common VAD flush logic in one place,
// while provider modules keep their transport-specific behavior.

function createRecordingUiBindingScope(globalKey = "__recordingUIAbort_default") {
  try {
    window[globalKey]?.abort?.("re-init");
  } catch (_) {}
  const controller = new AbortController();
  window[globalKey] = controller;
  return controller.signal;
}

function createRecordingUiHelpers({
  logInfo = () => {},
  getMediaStream,
  setMediaStream,
  getAudioReader,
  setAudioReader,
} = {}) {
  function updateStatusMessage(message, color = "#333") {
    const statusElem = document.getElementById("statusMessage");
    if (!statusElem) return;
    statusElem.innerText = message;
    statusElem.style.color = color;
  }

  function setAbortButtonDisabled(disabled) {
    const abortButton = document.getElementById("abortButton");
    if (abortButton) abortButton.disabled = disabled;
  }

  function setStopPauseDisabled(disabled) {
    const stopButton = document.getElementById("stopButton");
    const pauseResumeButton = document.getElementById("pauseResumeButton");
    if (stopButton) stopButton.disabled = disabled;
    if (pauseResumeButton) pauseResumeButton.disabled = disabled;
  }

  function setRecordingControlsIdle() {
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    const pauseResumeButton = document.getElementById("pauseResumeButton");
    setAbortButtonDisabled(true);
    if (startButton) startButton.disabled = false;
    if (stopButton) stopButton.disabled = true;
    if (pauseResumeButton) pauseResumeButton.disabled = true;
  }

  function stopMicrophone() {
    const mediaStream = typeof getMediaStream === "function" ? getMediaStream() : null;
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      if (typeof setMediaStream === "function") setMediaStream(null);
      logInfo("Microphone stopped.");
    }

    const audioReader = typeof getAudioReader === "function" ? getAudioReader() : null;
    if (audioReader) {
      try {
        audioReader.cancel();
      } catch (_) {}
      if (typeof setAudioReader === "function") setAudioReader(null);
    }
  }

  return {
    updateStatusMessage,
    setAbortButtonDisabled,
    setStopPauseDisabled,
    setRecordingControlsIdle,
    stopMicrophone,
  };
}

function concatFloat32Segments(segments) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return new Float32Array(0);
  }
  const totalSamples = segments.reduce((sum, seg) => sum + (seg?.length || 0), 0);
  const combined = new Float32Array(totalSamples);
  let offset = 0;
  for (const seg of segments) {
    if (!seg?.length) continue;
    combined.set(seg, offset);
    offset += seg.length;
  }
  return combined;
}

function flushPendingVadSegments({
  segments,
  sampleRate = 16000,
  floatTo16BitPCM,
  encodeWAV,
  enqueueTranscription,
  chunkNumber,
}) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return chunkNumber;
  }
  const combined = concatFloat32Segments(segments);
  segments.length = 0;

  if (!combined.length) {
    return chunkNumber;
  }

  const wavBlob = encodeWAV(floatTo16BitPCM(combined), sampleRate, 1);
  enqueueTranscription(wavBlob, chunkNumber);
  return chunkNumber + 1;
}

function flushPendingVadSegmentsGuarded({
  segments,
  sampleRate = 16000,
  floatTo16BitPCM,
  encodeWAV,
  enqueueTranscription,
  chunkNumber,
  isLocked = () => false,
  setLocked = () => {},
}) {
  if (typeof isLocked === "function" && isLocked()) {
    return chunkNumber;
  }

  if (typeof setLocked === "function") {
    setLocked(true);
  }

  try {
    return flushPendingVadSegments({
      segments,
      sampleRate,
      floatTo16BitPCM,
      encodeWAV,
      enqueueTranscription,
      chunkNumber,
    });
  } finally {
    if (typeof setLocked === "function") {
      setLocked(false);
    }
  }
}

function installSafeRecordingLoadStop({
  stopMicrophone,
  getSileroVAD,
  shouldSkipLoadStop,
} = {}) {
  window.addEventListener("load", () => {
    try {
      // A dynamically created Workspace becomes interactive at DOMContentLoaded,
      // before every image/ad resource has necessarily finished loading. Never
      // let this late safety callback tear down a session the user already
      // started or intentionally left paused.
      if (shouldSkipLoadStop?.()) return;
    } catch (_) {}

    try {
      stopMicrophone?.();
    } catch (_) {}

    try {
      const sileroVAD = getSileroVAD?.();
      if (sileroVAD && typeof sileroVAD.pause === "function") {
        sileroVAD.pause().catch(() => {});
      }
    } catch (_) {}
  });
}

export {
  createRecordingUiBindingScope,
  createRecordingUiHelpers,
  concatFloat32Segments,
  flushPendingVadSegments,
  flushPendingVadSegmentsGuarded,
  installSafeRecordingLoadStop,
};
