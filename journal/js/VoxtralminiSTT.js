import { bindRecordingAction, disposeVAD, startVerifiedVAD } from './core/recording-lifecycle.js';
import {
  createRecordingUiBindingScope,
  createRecordingUiHelpers,
  flushPendingVadSegmentsGuarded,
  installSafeRecordingLoadStop,
} from './core/recording-runner.js';

// VoxtralminiSTT.js
// Updated recording module without encryption/HMAC mechanisms,
// processing audio chunks using OfflineAudioContext,
// and implementing a client-side transcription queue that sends each processed chunk directly to OpenAI's Whisper API.
let transcriptionError = false;
let STT_ENDPOINT_MODE = "transcriptions";

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit signed integer
  }
  // Convert to an unsigned 32-bit integer and return as string.
  return (hash >>> 0).toString();
}

const DEBUG = true;
// — Silero VAD initialization —
// Holds the loaded VAD instance
let sileroVAD = null;
// Buffer for accumulating VAD-detected speech segments
let pendingVADChunks = [];
// Minimum total speech duration before sending (in seconds)
const MIN_CHUNK_DURATION_SECONDS = 30;
// Configure callbacks for speech start/end
const sileroVADOptions = {
  // Force a final speech-end event when pause/stop is called, even mid-speech
  submitUserSpeechOnPause: true,
  // ─── MODEL THRESHOLDS & SILENCE PARAMETERS ───────────────
  // confidence ≥ 0.5 → speech
  positiveSpeechThreshold: 0.4,
  // confidence ≤ 0.35 → silence
  negativeSpeechThreshold: 0.35,
  // allow up to 3 “false-silence” frames before firing onSpeechEnd
  redemptionFrames: 5,
  // prepend 1 frame of audio before onSpeechStart
  preSpeechPadFrames: 2,
  // require at least 3 consecutive speech frames to declare onSpeechStart
  minSpeechFrames: 3,
  onSpeechStart: () => {
    // Prevent late VAD callbacks from reviving recording after pause/stop.
    if (manualStop || recordingPaused) return;
    logInfo("Silero VAD: speech started");
    recordingActive = true;
    chunkStartTime = Date.now();
    // Always show “Recording…” when speech starts, even on Resume
    updateStatusMessage("Recording…", "green");
  },
  onSpeechEnd: (audioFloat32) => {
    // Prevent late VAD callbacks after pause/stop from buffering or enqueueing more audio.
    if (manualStop || recordingPaused) return;
    logInfo("Silero VAD: speech ended — buffering audio");
    // Accumulate this segment
    pendingVADChunks.push(audioFloat32);
    // Check if we've buffered enough total duration
    const totalSamples = pendingVADChunks.reduce((sum, seg) => sum + seg.length, 0);
    if (totalSamples >= MIN_CHUNK_DURATION_SECONDS * 16000) {
      // Concatenate into one Float32Array
      const combined = new Float32Array(totalSamples);
      let offset = 0;
      for (const seg of pendingVADChunks) {
        combined.set(seg, offset);
        offset += seg.length;
      }
      // Encode and send for transcription
      const wavBlob = encodeWAV(floatTo16BitPCM(combined), 16000, 1);
      enqueueTranscription(wavBlob, chunkNumber++);
      // Reset buffer
      pendingVADChunks = [];
    }
  }
};

function logDebug(message, ...optionalParams) {
  if (DEBUG) {
    console.debug(new Date().toISOString(), "[DEBUG]", message, ...optionalParams);
  }
}
function logInfo(message, ...optionalParams) {
  console.info(new Date().toISOString(), "[INFO]", message, ...optionalParams);
}
function logError(message, ...optionalParams) {
  console.error(new Date().toISOString(), "[ERROR]", message, ...optionalParams);
}

const MIN_CHUNK_DURATION = 120000; // 120 seconds
let recordingActive = false; // only true after first speech detected
let mediaStream = null;
let processedAnyAudioFrames = false;
let audioReader = null;

let completionTimerInterval = null;
let completionStartTime = 0;
let groupId = null;
let chunkNumber = 1;
let manualStop = false;
let abortRequested = false;
let transcriptChunks = {}; // {chunkNumber: transcript}
let transcriptFrozen = false;
let pollingIntervals = {}; // (removed polling functions, kept for legacy structure)

let chunkStartTime = 0;
let lastFrameTime = 0;
let lastSpeechTime = 0;
let chunkTimeoutId;
let expectedChunks = 0;

let chunkProcessingLock = false;
let pendingStop = false;
let finalChunkProcessed = false;
let recordingPaused = false;
let audioFrames = []; // Buffer for audio frames

// --- New Transcription Queue Variables ---
let transcriptionQueue = []; // Queue of { chunkNumber, blob }
let isProcessingQueue = false;

// --- NEW: Session cancel / abort plumbing ---
// Each time Start is clicked, we create a fresh session + abort controller.
// Anything still running from the previous session gets aborted and/or ignored.
let transcriptionSessionAbortController = new AbortController();
let processingQueueSessionId = null; // tracks which session currently owns the queue worker

function beginFreshTranscriptionSession() {
  // Abort any in-flight network requests/transcriptions from the previous session.
  try {
    transcriptionSessionAbortController.abort("new session started");
  } catch (_) {}
  transcriptionSessionAbortController = new AbortController();

  // Hard-clear any pending work so Start always begins clean.
  transcriptionQueue = [];
  isProcessingQueue = false;
  processingQueueSessionId = null;

  // Also clear any buffered VAD segments so we don't accidentally flush old audio.
  pendingVADChunks = [];

  // Release chunk stop/flush locks if they were left set by an earlier run.
  chunkProcessingLock = false;
  pendingStop = false;
  manualStop = false;
  abortRequested = false;
  transcriptFrozen = false;
}

// --- Utility Functions ---
const {
  updateStatusMessage,
  setAbortButtonDisabled,
  setStopPauseDisabled,
  setRecordingControlsIdle,
  stopMicrophone,
} = createRecordingUiHelpers({
  logInfo,
  getMediaStream: () => mediaStream,
  setMediaStream: (value) => { mediaStream = value; },
  getAudioReader: () => audioReader,
  setAudioReader: (value) => { audioReader = value; },
});

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) {
    return totalSec + " sec";
  } else {
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return minutes + " min" + (seconds > 0 ? " " + seconds + " sec" : "");
  }
}

// --- Base64 Helper Functions (kept for legacy) ---
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  return arrayBufferToBase64(buffer);
}

async function sendChunkChat({ apiKey, model, audioBase64 }, { signal } = {}, retries = 5, backoff = 2000) {
  try {
    return await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "input_audio", input_audio: audioBase64 },
              {
                type: "text",
                text:
                  "Transcribe the audio verbatim in norwegian." +
                  "Output ONLY the transcript text.",
              },
            ],
          },
        ],
        temperature: 0,
      }),
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    if (retries > 0) {
      console.warn(`Chunk failed, retrying in ${backoff}ms… (${retries} left)`);
      await new Promise(res => setTimeout(res, backoff));
      return sendChunkChat({ apiKey, model, audioBase64 }, { signal }, retries - 1, backoff * 1.5);
    }
    throw err;
  }
}

async function sendChunkTranscription(
  { apiKey, model, wavBlob, filename = "audio.wav", language = null },
  { signal } = {},
  retries = 5,
  backoff = 2000
) {
  try {
    // /v1/audio/transcriptions expects a file upload (or file_url/file_id).
    const form = new FormData();
    form.append("model", model);
    form.append("file", wavBlob, filename);
    if (language) form.append("language", language);
    return await fetch("https://api.mistral.ai/v1/audio/transcriptions", {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        // NOTE: do NOT set Content-Type; the browser will set the multipart boundary.
      },
      body: form,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    if (retries > 0) {
      console.warn(`Chunk failed, retrying in ${backoff}ms… (${retries} left)`);
      await new Promise(res => setTimeout(res, backoff));
      return sendChunkTranscription({ apiKey, model, wavBlob, filename }, { signal }, retries - 1, backoff * 1.5);
    }
    throw err;
  }
}

// --- Device Token Management ---
function getDeviceToken() {
  let token = localStorage.getItem("device_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("device_token", token);
  }
  return token;
}

// --- API Key Retrieval ---
// With encryption removed, we now simply get the API key from sessionStorage.
function getAPIKey() {
  return sessionStorage.getItem("user_api_key");
}

async function sendChunk(formData, { signal } = {}, retries = 5, backoff = 2000) {
  // grab the API key at call-time
  const apiKey = getAPIKey();
  if (!apiKey) throw new Error("API key not available");
  try {
    return await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
        signal,
      }
    );
  } catch (err) {
    if (retries > 0) {
      console.warn(`Chunk failed, retrying in ${backoff}ms… (${retries} left)`);
      await new Promise(res => setTimeout(res, backoff));
      return sendChunk(formData, { signal }, retries - 1, backoff * 1.5);
    }
    throw err;
  }
}

// --- File Blob Processing ---
// Previously used for encryption; now simply returns the original blob along with markers.
async function encryptFileBlob(blob) {
  const apiKey = getAPIKey();
  if (!apiKey) throw new Error("API key not available");
  const deviceToken = getDeviceToken();
  const apiKeyMarker = hashString(apiKey);
  const deviceMarker = hashString(deviceToken);
  // Return the original blob without any encryption; iv and salt are empty.
  return {
    encryptedBlob: blob,
    iv: "",
    salt: "",
    apiKeyMarker,
    deviceMarker
  };
}

// --- OfflineAudioContext Processing ---
// This function takes interleaved PCM samples (Float32Array), the original sample rate, and the number of channels,
// converts the audio to mono (averaging channels if needed), resamples to 16kHz, and applies 0.3s fade-in/out.
// It returns a 16-bit PCM WAV Blob.
async function processAudioUsingOfflineContext(pcmFloat32, originalSampleRate, numChannels) {
  const targetSampleRate = 16000;

  // Calculate the number of frames
  const numFrames = pcmFloat32.length / numChannels;

  // Create an AudioBuffer in a temporary AudioContext
  let tempCtx = new AudioContext();
  let originalBuffer = tempCtx.createBuffer(numChannels, numFrames, originalSampleRate);

  if (numChannels === 1) {
    originalBuffer.copyToChannel(pcmFloat32, 0);
  } else {
    // Deinterleave and copy each channel
    for (let ch = 0; ch < numChannels; ch++) {
      let channelData = new Float32Array(numFrames);
      for (let i = 0; i < numFrames; i++) {
        channelData[i] = pcmFloat32[i * numChannels + ch];
      }
      originalBuffer.copyToChannel(channelData, ch);
    }
  }
  // Convert to mono by averaging channels if necessary
  let monoBuffer;
  if (numChannels > 1) {
    let monoData = new Float32Array(numFrames);
    for (let i = 0; i < numFrames; i++) {
      let sum = 0;
      for (let ch = 0; ch < numChannels; ch++) {
        sum += originalBuffer.getChannelData(ch)[i];
      }
      monoData[i] = sum / numChannels;
    }
    monoBuffer = tempCtx.createBuffer(1, numFrames, originalSampleRate);
    monoBuffer.copyToChannel(monoData, 0);
  } else {
    monoBuffer = originalBuffer;
  }
  tempCtx.close();

  // Set up OfflineAudioContext for resampling
  const duration = monoBuffer.duration;
  const offlineLength = Math.max(1, Math.ceil(targetSampleRate * duration));
  const offlineCtx = new OfflineAudioContext(1, offlineLength, targetSampleRate);

  const source = offlineCtx.createBufferSource();
  source.buffer = monoBuffer;

  // Modified code snippet to fix the negative time error:
  const gainNode = offlineCtx.createGain();
  const fadeDuration = 0.3;
  gainNode.gain.setValueAtTime(0, 0);
  gainNode.gain.linearRampToValueAtTime(1, fadeDuration);

  // Compute fade-out start time, ensuring it's non-negative
  const fadeOutStart = Math.max(0, duration - fadeDuration);
  if (duration < fadeDuration * 2) {
    console.warn(`[Audio] Short chunk (${duration.toFixed(2)}s) — fade-in/out may be squished`);
  }

  gainNode.gain.setValueAtTime(1, fadeOutStart);
  gainNode.gain.linearRampToValueAtTime(0, duration);

  source.connect(gainNode).connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  const processedData = renderedBuffer.getChannelData(0);
  const processedInt16 = floatTo16BitPCM(processedData);
  const wavBlob = encodeWAV(processedInt16, targetSampleRate, 1);
  await offlineCtx.close();
  return wavBlob;
}

// --- New: Transcribe Chunk Directly ---
// Sends the WAV blob directly to OpenAI's Whisper API and returns the transcript.
async function transcribeChunkDirectly(wavBlob, chunkNum, { signal, sessionId } = {}) {
  const apiKey = getAPIKey();
  if (!apiKey) throw new Error("API key not available for transcription");

  const model = "voxtral-mini-2602";
  const language = null;
  try {
    let response;
    response = await sendChunkTranscription(
      { apiKey, model, wavBlob, filename: `chunk-${chunkNum}.wav`, language },
      { signal }
    );

    if (!response.ok) {
      // Try JSON first, otherwise text
      let msg = "";
      try {
        const j = await response.json();
        msg = j?.error?.message || JSON.stringify(j);
      } catch {
        msg = await response.text();
      }
      throw new Error(`Mistral STT error: ${msg || `${response.status} ${response.statusText}`}`);
    }
    const result = await response.json();
    // /v1/audio/transcriptions => { text: "..." }
    return (result?.text || "");
  } catch (error) {
    // If user started a new session, treat this as a silent cancel.
    if (signal?.aborted || (sessionId && sessionId !== groupId)) {
      return "";
    }
    logError(`Error transcribing chunk ${chunkNum}:`, error);
    updateStatusMessage("Error transcribing with Mistral Voxtral Mini Transcribe 2. Please try again.", "red");
    transcriptionError = true;
    return `[Error transcribing chunk ${chunkNum}]`;
  }
}

// --- Transcription Queue Processing ---
// Adds a processed chunk to the queue and processes chunks sequentially.
function enqueueTranscription(wavBlob, chunkNum) {
  transcriptionQueue.push({ sessionId: groupId, signal: transcriptionSessionAbortController.signal, chunkNum, wavBlob });
  processTranscriptionQueue();
}

function flushPendingVADChunks() {
  chunkNumber = flushPendingVadSegmentsGuarded({
    segments: pendingVADChunks,
    sampleRate: 16000,
    floatTo16BitPCM,
    encodeWAV,
    enqueueTranscription,
    chunkNumber,
  });
}

async function processTranscriptionQueue() {
  const mySessionId = groupId;
  const mySignal = transcriptionSessionAbortController.signal;

  // If a worker is already running for THIS SAME session, just let it drain.
  if (isProcessingQueue && processingQueueSessionId === mySessionId) return;

  // If a worker is running for an OLD session, do NOT wait for it.
  // Start a fresh worker for the current session (the old one will become a no-op once aborted).
  isProcessingQueue = true;
  processingQueueSessionId = mySessionId;

  try {
    while (transcriptionQueue.length > 0) {
      // If a new session started, abandon this worker immediately.
      if (groupId !== mySessionId || mySignal.aborted) break;

      const item = transcriptionQueue.shift();
      if (!item) continue;

      // Skip anything not belonging to this session.
      if (item.sessionId !== mySessionId) continue;

      let { chunkNum, wavBlob } = item;
      logInfo(`Transcribing chunk ${chunkNum}...`);

      const transcript = await transcribeChunkDirectly(wavBlob, chunkNum, {
        signal: item.signal || mySignal,
        sessionId: mySessionId,
      });

      // If a new session started while we were transcribing, ignore the result.
      if (groupId !== mySessionId || mySignal.aborted) break;

      transcriptChunks[chunkNum] = transcript;
      updateTranscriptionOutput();

      // free this chunk’s audio immediately
      wavBlob = null;
    }
  } finally {
    // Only the owning worker may clear the flag.
    if (processingQueueSessionId === mySessionId) {
      isProcessingQueue = false;
      processingQueueSessionId = null;
    }
  }
}

// --- Removed: Polling functions (pollChunkTranscript) since we now transcribe directly ---

// --- Audio Chunk Processing ---
async function processAudioChunkInternal(force = false) {
  if (audioFrames.length === 0) {
    logDebug("No audio frames to process.");
    return;
  }
  // Mark that we have processed at least one frame set.
  processedAnyAudioFrames = true;

  logInfo(`Processing ${audioFrames.length} audio frames for chunk ${chunkNumber}.`);
  const framesToProcess = audioFrames;
  audioFrames = []; // Clear the buffer
  const sampleRate = framesToProcess[0].sampleRate;
  const numChannels = framesToProcess[0].numberOfChannels;
  let pcmDataArray = [];
  for (const frame of framesToProcess) {
    const numFrames = frame.numberOfFrames;
    if (numChannels === 1) {
      const channelData = new Float32Array(numFrames);
      frame.copyTo(channelData, { planeIndex: 0 });
      pcmDataArray.push(channelData);
    } else {
      let channelData = [];
      for (let c = 0; c < numChannels; c++) {
        const channelArray = new Float32Array(numFrames);
        frame.copyTo(channelArray, { planeIndex: c });
        channelData.push(channelArray);
      }
      const interleaved = new Float32Array(numFrames * numChannels);
      for (let i = 0; i < numFrames; i++) {
        for (let c = 0; c < numChannels; c++) {
          interleaved[i * numChannels + c] = channelData[c][i];
        }
      }
      pcmDataArray.push(interleaved);
    }
    frame.close();
  }
  const totalLength = pcmDataArray.reduce((sum, arr) => sum + arr.length, 0);
  const pcmFloat32 = new Float32Array(totalLength);
  let offset = 0;
  for (const arr of pcmDataArray) {
    pcmFloat32.set(arr, offset);
    offset += arr.length;
  }

  // Process the raw audio samples using OfflineAudioContext:
  // Convert to mono, resample to 16kHz, and apply 0.3s fade-in/out.
  // No extra silence padding—just resample & fade the raw PCM
  const wavBlob = await processAudioUsingOfflineContext(
    pcmFloat32,
    sampleRate,
    numChannels
  );

  // Instead of uploading to a backend, enqueue this processed chunk for direct transcription.
  enqueueTranscription(wavBlob, chunkNumber);

  chunkNumber++;
}

async function safeProcessAudioChunk(force = false) {
  if (manualStop && finalChunkProcessed) {
    logDebug("Final chunk already processed; skipping safeProcessAudioChunk.");
    return;
  }
  if (chunkProcessingLock) {
    logDebug("Chunk processing is locked; skipping safeProcessAudioChunk.");
    return;
  }
  chunkProcessingLock = true;
  await processAudioChunkInternal(force);
  chunkProcessingLock = false;
  if (pendingStop) {
    pendingStop = false;
    finalizeStop();
  }
}

function finalizeStop() {
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");
  const pauseResumeButton = document.getElementById("pauseResumeButton");
  if (startButton) startButton.disabled = false;
  if (stopButton) stopButton.disabled = true;
  if (pauseResumeButton) pauseResumeButton.disabled = true;
  logInfo("Recording stopped by user. Finalizing transcription.");
  // Optionally, you could wait here for the queue to empty before declaring completion.
}

function updateTranscriptionOutput() {
  if (transcriptFrozen) return;
  const sortedKeys = Object.keys(transcriptChunks).map(Number).sort((a, b) => a - b);
  let combinedTranscript = "";
  sortedKeys.forEach(key => {
    combinedTranscript += transcriptChunks[key] + " ";
  });
  const transcriptionElem = document.getElementById("transcription");
  if (transcriptionElem) {
    transcriptionElem.value = combinedTranscript.trim();
  }
  // Guard against the "expectedChunks is still 0" race during Stop()
  if (manualStop && expectedChunks > 0 && Object.keys(transcriptChunks).length >= expectedChunks) {
    clearInterval(completionTimerInterval);
    if (!transcriptionError) {
      updateStatusMessage("Transcription finished!", "green");
      window.__app?.emitTranscriptionFinished?.({ provider: "voxtral", reason: "queueDrained" });
      logInfo("Transcription complete.");
    } else {
      logInfo("Transcription complete with errors; keeping error message visible.");
    }
    transcriptChunks = {};
  }
}

function floatTo16BitPCM(input) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

function encodeWAV(samples, sampleRate, numChannels) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    view.setInt16(offset, samples[i], true);
  }
  return new Blob([view], { type: 'audio/wav' });
}

function scheduleChunk() {
  // bail out immediately if we’ve stopped or paused
  if (!recordingActive || manualStop || recordingPaused) return;

  const elapsed = Date.now() - chunkStartTime;
  const silenceFor = Date.now() - lastSpeechTime;

  if (elapsed >= MIN_CHUNK_DURATION && silenceFor >= SILENCE_DURATION) {
    logInfo("Silence detected after min-duration; closing chunk.");
    safeProcessAudioChunk();
    recordingActive = false;
    chunkStartTime = Date.now();
    lastSpeechTime = Date.now();
    logInfo("Listening for speech…");

    // after closing a chunk we do NOT immediately re-arm the timer;
    // we’ll wait for next `onSpeechStart` to call scheduleChunk again
  } else {
    // only re-schedule while still in the middle of a potential chunk
    chunkTimeoutId = setTimeout(scheduleChunk, 500);
  }
}

function resetRecordingState() {
  // ─── Clear our quota-error flag for this session ───
  transcriptionError = false;
  // ─── Clear any old completion timer (we’re starting fresh) ───
  if (completionTimerInterval) {
    clearInterval(completionTimerInterval);
    completionTimerInterval = null;
  }
  const compTimerElem = document.getElementById("transcribeTimer");
  if (compTimerElem) compTimerElem.innerText = "Completion Timer: 0 sec";
  expectedChunks = 0;
  Object.values(pollingIntervals).forEach(interval => clearInterval(interval));
  pollingIntervals = {};
  clearTimeout(chunkTimeoutId);

  transcriptChunks = {};
  audioFrames = [];
  chunkStartTime = Date.now();
  lastFrameTime = Date.now();
  manualStop = false;
  abortRequested = false;
  transcriptFrozen = false;
  finalChunkProcessed = false;
  recordingPaused = false;
  groupId = Date.now().toString();
  chunkNumber = 1;

  processedAnyAudioFrames = false;
  // reset VAD state
  recordingActive = false;
}

function releaseAudioFrames() {
  audioFrames.forEach((frame) => {
    try { frame?.close?.(); } catch (_) {}
  });
  audioFrames = [];
}

async function disposeRecording({ reason = "workspace-dispose" } = {}) {
  try { window.__recordingUIAbort_voxtral?.abort?.(reason); } catch (_) {}
  try { transcriptionSessionAbortController.abort(reason); } catch (_) {}

  manualStop = true;
  abortRequested = true;
  transcriptFrozen = true;
  recordingActive = false;
  recordingPaused = false;
  pendingStop = false;
  chunkProcessingLock = false;

  clearTimeout(chunkTimeoutId);
  chunkTimeoutId = null;
  if (completionTimerInterval) clearInterval(completionTimerInterval);
  completionTimerInterval = null;
  Object.values(pollingIntervals).forEach((interval) => clearInterval(interval));
  pollingIntervals = {};

  const vadToDispose = sileroVAD;
  sileroVAD = null;
  try { stopMicrophone(); } catch (_) {}

  releaseAudioFrames();
  pendingVADChunks = [];
  transcriptionQueue = [];
  transcriptChunks = {};
  isProcessingQueue = false;
  processingQueueSessionId = null;
  expectedChunks = 0;
  processedAnyAudioFrames = false;
  await disposeVAD(vadToDispose);
}

function initRecording() {
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");
  const pauseResumeButton = document.getElementById("pauseResumeButton");
  const abortButton = document.getElementById("abortButton");
  if (!startButton || !stopButton || !pauseResumeButton) return;

  const uiSignal = createRecordingUiBindingScope("__recordingUIAbort_voxtral");
  const uiListenerOptions = { signal: uiSignal };

  // --- PULL readLoop INTO SHARED SCOPE ---
  async function readLoop() {
    try {
      const { done, value } = await audioReader.read();
      if (done) {
        logInfo("Audio track reading complete.");
        return;
      }
      // VAD computation
      const numSamples = value.numberOfFrames * value.numberOfChannels;
      const buf = new Float32Array(numSamples);
      value.copyTo(buf, { planeIndex: 0 });
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
      const rms = Math.sqrt(sumSq / buf.length);
      logDebug(`RMS=${rms.toFixed(5)}`);

      if (rms > VAD_THRESHOLD) {
        lastSpeechTime = Date.now();
        if (!recordingActive) {
          // — NEW: log whenever speech is detected
          logInfo("Speech detected… recording");
          recordingActive = true;
          chunkStartTime = Date.now();

          // First-chunk UX tweaks (recording timer is centralized in transcribe.html)
          if (chunkNumber === 1) {
            pauseResumeButton.innerText = "Pause Recording";
            updateStatusMessage("Recording…", "green");
          }

          scheduleChunk();
        }
      }

      if (recordingActive) {
        audioFrames.push(value);
      }
      readLoop();
    } catch (err) {
      logError("Error reading audio frames", err);
    }
  }

  bindRecordingAction(startButton, 'start', async (operation) => {
    // Retrieve the API key before starting.
    const apiKey = getAPIKey();
    if (!apiKey) {
      throw new Error("Please enter your Mistral (Voxtral) API key before starting the recording.");
    }
    startButton.disabled = true;

    // NEW: Start is a hard reset: abort/clear any pending transcription work.
    beginFreshTranscriptionSession();
    resetRecordingState();
    const transcriptionElem = document.getElementById("transcription");
    if (transcriptionElem) transcriptionElem.value = "";

    // initialize and start Silero VAD
    updateStatusMessage("Loading voice-activity model...", "orange");
    try {
      sileroVAD = await startVerifiedVAD(options => vad.MicVAD.new(options), sileroVADOptions, operation);
      updateStatusMessage("Listening for speech…", "green");
      logInfo("Silero VAD started");
      setStopPauseDisabled(false);
      pauseResumeButton.innerText = "Pause Recording";
      setAbortButtonDisabled(false);
      return 'recording';
    } catch (error) {
      updateStatusMessage("VAD initialization error: " + error, "red");
      logError("Silero VAD error", error);
      startButton.disabled = false;
      setAbortButtonDisabled(true);
      throw error;
    }
  }, uiListenerOptions);

  bindRecordingAction(pauseResumeButton, 'pauseResume', async (operation) => {
    if (pauseResumeButton.disabled) return;
    setStopPauseDisabled(true);
    setAbortButtonDisabled(true);

    if (recordingPaused) {
      // RESUME: destroy old VAD and start a fresh one
      updateStatusMessage("Resuming recording…", "orange");
      try {
        // ── destroy previous VAD instance to free WASM and buffers ──
        if (sileroVAD && typeof sileroVAD.destroy === "function") {
          await operation.wait(sileroVAD.destroy());
        }
        // re-create the VAD (this will re-prompt/open the mic)
        sileroVAD = await startVerifiedVAD(options => vad.MicVAD.new(options), sileroVADOptions, operation);
        recordingPaused = false;

        pauseResumeButton.innerText = "Pause Recording";
        updateStatusMessage("Listening for speech…", "green");
        logInfo("Silero VAD resumed");
        return 'recording';
      } catch (err) {
        updateStatusMessage("Error resuming VAD: " + err, "red");
        recordingPaused = true;
        logError("Error resuming Silero VAD:", err);
          throw err;
      } finally {
        setStopPauseDisabled(false);
        setAbortButtonDisabled(false);
      }
    } else {
      // Do NOT set recordingPaused yet — submitUserSpeechOnPause fires
      // a final onSpeechEnd inside sileroVAD.pause() with the tail audio.
      // onSpeechEnd guards on recordingPaused, so flipping the flag
      // before pause() silently drops the tail segment.
      recordingActive = false;
      clearTimeout(chunkTimeoutId);

      // Flush any already-buffered chunks (not the in-flight one yet).
      flushPendingVADChunks();

      // PAUSE: stop VAD (fires final onSpeechEnd with tail audio)
      updateStatusMessage("Pausing recording…", "orange");
      try {
        await sileroVAD.pause();
        logInfo("Silero VAD paused");
      } catch (err) {
        logError("Error pausing Silero VAD:", err);
      throw err;
      }
      // Let the final onSpeechEnd land before we set the guard flag.
      await Promise.resolve();
      recordingPaused = true;

      // Actually stop the mic that Silero opened:
      if (sileroVAD.stream) {
        sileroVAD.stream.getTracks().forEach(t => t.stop());
      }
      stopMicrophone();

      // Flush again — captures the tail segment pushed by the final
      // onSpeechEnd above.
      flushPendingVADChunks();

      pauseResumeButton.innerText = "Resume Recording";
      setStopPauseDisabled(false);
      setAbortButtonDisabled(true);
      updateStatusMessage("Recording paused", "orange");
      logInfo("Recording paused; buffered speech flushed");
      return 'paused';
    }
  }, uiListenerOptions);

  if (abortButton) {
    bindRecordingAction(abortButton, 'abort', async (operation) => {
      if (abortButton.disabled) return;
      setAbortButtonDisabled(true);
      setStopPauseDisabled(true);

      abortRequested = true;
      transcriptFrozen = true;
      manualStop = true;
      recordingPaused = false;
      recordingActive = false;
      finalChunkProcessed = false;
      clearTimeout(chunkTimeoutId);

      try {
        if (sileroVAD && typeof sileroVAD.pause === "function") {
          await sileroVAD.pause();
        }
      } catch (err) {
        logDebug("Silero VAD pause on abort failed:", err);
      }

      try {
        if (sileroVAD?.stream) {
          sileroVAD.stream.getTracks().forEach(t => t.stop());
        }
      } catch (err) {
        logDebug("Silero VAD stream stop on abort failed:", err);
      }

      try {
        if (sileroVAD && typeof sileroVAD.destroy === "function") {
          await operation.wait(sileroVAD.destroy());
        }
      } catch (err) {
        logDebug("Silero VAD destroy on abort failed:", err);
      } finally {
        sileroVAD = null;
      }

      stopMicrophone();

      try {
        transcriptionSessionAbortController.abort("recording aborted");
      } catch (_) {}
      transcriptionSessionAbortController = new AbortController();

      transcriptionQueue = [];
      isProcessingQueue = false;
      processingQueueSessionId = null;
      pendingVADChunks = [];
      chunkProcessingLock = false;
      pendingStop = false;
      if (completionTimerInterval) {
        clearInterval(completionTimerInterval);
        completionTimerInterval = null;
      }

      setRecordingControlsIdle();
      updateStatusMessage("Recording aborted.", "orange");
      logInfo("Recording aborted by user; discarded pending transcription work.");
    }, uiListenerOptions);
  }

  bindRecordingAction(stopButton, 'stop', async (operation) => {
    if (stopButton.disabled) return;
    setStopPauseDisabled(true);
    setAbortButtonDisabled(true);
    updateStatusMessage("Finishing transcription...", "blue");
    // --- FORCE-FLUSH the in-flight VAD segment via the public API ---
    // If MicVAD supports endSegment(), use it to emit the last audio
    if (sileroVAD && typeof sileroVAD.endSegment === "function") {
      const result = sileroVAD.endSegment();
      const audio = result?.audio;
      if (audio && audio.length) {
        pendingVADChunks.push(audio);
      }
    }
    // First pause VAD to emit final onSpeechEnd.
    // IMPORTANT: do not set manualStop until after pause(), otherwise onSpeechEnd is ignored.
    if (sileroVAD) {
      try {
        await sileroVAD.pause(); // pause VAD to emit final onSpeechEnd
        logInfo("Silero VAD paused on stop");
      } catch (err) {
        logError("Error pausing Silero VAD on stop:", err);
      throw err;
      }
      // stop the mic Silero opened
      if (sileroVAD.stream) {
        sileroVAD.stream.getTracks().forEach(t => t.stop());
      }
      // destroy the VAD instance to free WASM/model memory
      if (typeof sileroVAD.destroy === "function") {
        await operation.wait(sileroVAD.destroy());
      }
      sileroVAD = null;
    }
    stopMicrophone();

    // Flush any pending VAD segments before stopping
    flushPendingVADChunks();
    // Compute how many chunks we expect *before* draining,
    // so updateTranscriptionOutput() doesn't treat expectedChunks=0 as "done".
    expectedChunks = chunkNumber - 1;

    // Now block further VAD callbacks / UI writes
    manualStop = true;

    // Start completion timer immediately (it measures the time spent finishing transcription)
    if (expectedChunks > 0 && !completionTimerInterval) {
      completionStartTime = Date.now();
      completionTimerInterval = setInterval(() => {
        const timerElem = document.getElementById("transcribeTimer");
        if (timerElem) {
          timerElem.innerText = "Completion Timer: " + formatTime(Date.now() - completionStartTime);
        }
      }, 1000);
    }

    // Drain the queue so the final chunk is actually sent
    await processTranscriptionQueue();

    clearTimeout(chunkTimeoutId);

    // keep existing stopMicrophone, timers and flush logic intact
    // ── If there's nothing left to transcribe (e.g. paused + all chunks done) ──
    if (audioFrames.length === 0 && pendingVADChunks.length === 0) {
      // stop the completion timer if it was running
      clearInterval(completionTimerInterval);

      // reset the displayed timer
      const compTimerElem = document.getElementById("transcribeTimer");
      if (compTimerElem) compTimerElem.innerText = "Completion Timer: 0 sec";

      updateTranscriptionOutput();

      // ✅ No audio captured → declare completion (otherwise UI stays on "Finishing...")
      updateStatusMessage("Transcription finished!", "green");
      window.__app?.emitTranscriptionFinished?.({ provider: "voxtral", reason: "noAudio" });

      // Re-enable/disable buttons for a fresh start
      const startButton = document.getElementById("startButton");
      if (startButton) startButton.disabled = false;
      const stopButton = document.getElementById("stopButton");
      if (stopButton) stopButton.disabled = true;
      const pauseResumeButton = document.getElementById("pauseResumeButton");
      if (pauseResumeButton) pauseResumeButton.disabled = true;
      setAbortButtonDisabled(true);

      logInfo("Stop clicked with no pending audio frames; instant completion.");
      return;
    }

    // NEW: If the recording is paused, finalize immediately.
    if (recordingPaused) {
      finalChunkProcessed = true;
      const compTimerElem = document.getElementById("transcribeTimer");
      if (compTimerElem) {
        compTimerElem.innerText = "Completion Timer: 0 sec";
      }

      const startButton = document.getElementById("startButton");
      if (startButton) startButton.disabled = false;
      stopButton.disabled = true;
      const pauseResumeButton = document.getElementById("pauseResumeButton");
      if (pauseResumeButton) pauseResumeButton.disabled = true;
      setAbortButtonDisabled(true);
      logInfo("Recording paused and stop pressed; transcription complete without extra processing.");
      return;
    }

    // Continue with the existing logic if not paused:
    if (audioFrames.length === 0 && !processedAnyAudioFrames) {
      // No speech ever detected → treat as instant transcription complete
      resetRecordingState();
      // Force completion timer back to zero
      const compTimerElem = document.getElementById("transcribeTimer");
      if (compTimerElem) compTimerElem.innerText = "Completion Timer: 0 sec";
      // Reset buttons
      const startButton = document.getElementById("startButton");
      if (startButton) startButton.disabled = false;
      stopButton.disabled = true;
      const pauseResumeButton = document.getElementById("pauseResumeButton");
      if (pauseResumeButton) pauseResumeButton.disabled = true;
      setAbortButtonDisabled(true);
      logInfo("No audio frames captured; instant transcription complete.");
      return;
    } else {
      if (chunkProcessingLock) {
        pendingStop = true;
        logDebug("Chunk processing locked at stop; setting pendingStop.");
      } else {
        await safeProcessAudioChunk(true);
        if (!processedAnyAudioFrames) {
          resetRecordingState();
          const compTimerElem = document.getElementById("transcribeTimer");
          if (compTimerElem) {
            compTimerElem.innerText = "Completion Timer: 0 sec";
          }

          updateStatusMessage("Recording reset. Ready to start.", "green");
          const startButton = document.getElementById("startButton");
          if (startButton) startButton.disabled = false;
          stopButton.disabled = true;
          const pauseResumeButton = document.getElementById("pauseResumeButton");
          if (pauseResumeButton) pauseResumeButton.disabled = true;
          logInfo("No audio frames processed after safeProcessAudioChunk. Full reset performed.");
          processedAnyAudioFrames = false;
          return;
        } else {
          finalChunkProcessed = true;
          finalizeStop();
          logInfo("Stop button processed; final chunk handled.");
        }
      }
    }
  }, uiListenerOptions);
}

export { disposeRecording, initRecording };

// As soon as the page loads, ensure we never auto-open the mic:
window.addEventListener("load", () => {
  stopMicrophone();
  if (sileroVAD && typeof sileroVAD.pause === "function") {
    sileroVAD.pause().catch(() => {});
  }
});
