// One authority per Workspace. Button clicks request transitions; only the
// provider handler can confirm them. Nothing is shared with another frame.
const buttons = { start: 'startButton', pauseResume: 'pauseResumeButton', stop: 'stopButton', abort: 'abortButton' };
const handlers = new Map();
let current = null;
let lastRequest = null;
let state = { phase: 'idle', pending: false, error: '', action: '', sequence: 0 };

export function getRecordingLifecycle() { return { ...state }; }

export function resetRecordingLifecycle() {
  const operation = current;
  current = null;
  lastRequest = null;
  handlers.clear();
  operation?.controller.abort(new Error('Workspace disposed.'));
  publish('idle', 'reset');
}

function publish(phase, action, error = '', pending = false) {
  state = { phase, action, error, pending, sequence: state.sequence + 1 };
  window.dispatchEvent(new CustomEvent('recording:lifecycle', { detail: getRecordingLifecycle() }));
}

function failure(error) { return { ok: false, error: String(error), state: getRecordingLifecycle() }; }

export function requestRecordingAction(action) {
  const button = document.getElementById(buttons[action]);
  if (!handlers.has(action)) return Promise.resolve(failure('Recording provider is still loading. Try again.'));
  if (!button || button.disabled) return Promise.resolve(failure('This recording action is currently unavailable.'));
  if (current && action !== 'abort') return Promise.resolve(failure('Another recording action is still in progress.'));
  lastRequest = null;
  button.click(); // Retain existing date/clear-field and accessibility handlers.
  return lastRequest || Promise.resolve(failure('The recording action was not received.'));
}

export function bindRecordingAction(button, action, handler, options = {}) {
  const entry = { button, handler };
  handlers.set(action, entry);
  const listener = () => { lastRequest = execute(action, entry, options.signal); };
  button.addEventListener('click', listener, options);
  options.signal?.addEventListener('abort', () => {
    if (handlers.get(action) === entry) handlers.delete(action);
    if (current?.entry === entry) current.controller.abort(new Error('Recording provider changed.'));
  }, { once: true });
}

async function execute(action, entry, signal) {
  if (entry.button.disabled || signal?.aborted) return failure('Recording control is unavailable.');
  if (current && action !== 'abort') return failure('Another recording action is still in progress.');
  if (current) current.controller.abort(new Error('Recording aborted.'));
  const previousPhase = state.phase;
  const resuming = action === 'pauseResume' &&
    (previousPhase === 'paused' || /resume/i.test(entry.button.textContent));
  const phase = { start: 'starting', pauseResume: resuming ? 'resuming' : 'pausing', stop: 'stopping', abort: 'aborting' }[action];
  const controller = new AbortController();
  const operation = {
    entry, controller, signal: controller.signal,
    check() { if (controller.signal.aborted) throw controller.signal.reason; },
    wait(promise, disposeLate) {
      return new Promise((resolve, reject) => {
        const aborted = () => reject(controller.signal.reason);
        controller.signal.addEventListener('abort', aborted, { once: true });
        if (controller.signal.aborted) aborted();
        Promise.resolve(promise).then(value => {
          controller.signal.removeEventListener('abort', aborted);
          if (controller.signal.aborted) {
            try { Promise.resolve(disposeLate?.(value)).catch(() => {}); } catch (_) {}
            reject(controller.signal.reason);
          } else resolve(value);
        }, error => {
          controller.signal.removeEventListener('abort', aborted);
          reject(error);
        });
      });
    },
  };
  current = operation;
  publish(phase, action, '', true);
  // Do not time out Pause/Stop by discarding buffered audio. Existing safe
  // drains can take longer on slow PCs and retain their explicit Abort path.
  const timeout = phase === 'starting' || phase === 'resuming'
    ? setTimeout(() => controller.abort(new Error('Microphone start timed out. Open the main tab, check microphone permission, then try again.')), 60000)
    : null;
  try {
    const confirmed = await entry.handler(operation);
    operation.check();
    if (current !== operation) return failure('Recording action was superseded.');
    const next = confirmed || ({ stop: 'stopped', abort: 'aborted' }[action]);
    if (!['recording', 'paused', 'stopped', 'aborted'].includes(next)) {
      throw new Error(document.getElementById('statusMessage')?.textContent || 'Recording action was not confirmed.');
    }
    publish(next, action);
    return { ok: true, state: getRecordingLifecycle() };
  } catch (error) {
    if (current !== operation) return failure('Recording action was superseded.');
    const message = String(error?.message || error || 'Recording action failed.');
    publish('error', action, message);
    const status = document.getElementById('statusMessage');
    if (status) { status.textContent = message; status.style.color = '#b00020'; }
    // The provider handles capture cleanup. Keep Stop/Abort recoverable after
    // a failed drain; never enable Resume unless the provider confirmed it.
    if (phase === 'starting') {
      entry.button.disabled = false;
    } else if (phase === 'resuming') {
      entry.button.textContent = 'Resume Recording';
      entry.button.disabled = false;
    } else if (phase === 'pausing' || phase === 'stopping') {
      const stop = document.getElementById(buttons.stop);
      const abort = document.getElementById(buttons.abort);
      const pause = document.getElementById(buttons.pauseResume);
      if (stop) stop.disabled = false;
      if (abort) abort.disabled = false;
      if (pause) pause.disabled = true;
    }
    return failure(message);
  } finally {
    if (timeout !== null) clearTimeout(timeout);
    if (current === operation) current = null;
  }
}

export async function disposeVAD(mic) {
  if (!mic) return;
  // Stop tracks before awaiting any model cleanup, even if AudioContext is suspended.
  mic.stream?.getTracks().forEach(track => track.stop());
  try { await mic.destroy?.(); } catch (_) {}
}

export async function verifyAudioCapture(context, stream, operation) {
  if (!stream?.getAudioTracks().some(track => track.readyState === 'live')) {
    throw new Error('No live microphone track. Check microphone permission in the main tab.');
  }
  if (context?.state === 'suspended') await operation.wait(context.resume());
  operation.check();
  if (context?.state !== 'running') throw new Error('Audio capture is not running. Open the main tab and allow audio, then try again.');
}

export async function startVerifiedVAD(factory, options, operation) {
  let mic;
  let stream;
  let valid = true;
  const guarded = { ...options };
  for (const name of ['onSpeechStart', 'onSpeechEnd', 'onVADMisfire', 'onFrameProcessed']) {
    guarded[name] = (...args) => { if (valid) return options[name]?.(...args); };
  }
  try {
    // Own the stream before model loading. The pinned VAD library otherwise
    // leaves its microphone open if its async model initialization fails.
    stream = await operation.wait(navigator.mediaDevices.getUserMedia({ audio: {
      ...options.additionalAudioConstraints, channelCount: 1,
      echoCancellation: true, autoGainControl: true, noiseSuppression: true,
    } }), late => late.getTracks().forEach(track => track.stop()));
    guarded.stream = stream;
    mic = await operation.wait(factory(guarded), late => { valid = false; return disposeVAD(late); });
    const destroy = mic.destroy.bind(mic);
    mic.destroy = () => {
      valid = false;
      stream.getTracks().forEach(track => track.stop());
      return destroy();
    };
    await operation.wait(mic.start());
    await verifyAudioCapture(mic.audioContext, mic.stream, operation);
    return mic;
  } catch (error) {
    valid = false;
    stream?.getTracks().forEach(track => track.stop());
    await disposeVAD(mic);
    throw error;
  }
}
