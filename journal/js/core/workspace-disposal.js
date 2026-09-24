// Window-local resource disposal for one Workspace runtime.
//
// Every user Workspace owns its own isolated frame runtime. The top-level
// document is only the shared application shell and never doubles as a
// Workspace. Async providers need an explicit stop before a frame is removed, so
// resource owners register their teardown here. The registry is deliberately
// context-local: disposing one Workspace cannot affect another.

const STATE_KEY = "__workspaceDisposalStateV1";

function getState() {
  if (!window[STATE_KEY]) {
    window[STATE_KEY] = {
      workspaceDisposers: new Set(),
      windowDisposers: new Set(),
      lifecycleBound: false,
      finalized: false,
      finalPromise: null,
    };
  }
  return window[STATE_KEY];
}

function normalizeScope(scope) {
  return scope === "window" ? "window" : "workspace";
}

export function registerWorkspaceDisposer(disposer, { scope = "workspace" } = {}) {
  if (typeof disposer !== "function") return () => {};
  const state = getState();
  if (state.finalized) {
    // A lazy import may finish after its Workspace was removed.
    void runDisposers([disposer], { reason: "late-registration", final: true });
    return () => {};
  }
  const collection = normalizeScope(scope) === "window"
    ? state.windowDisposers
    : state.workspaceDisposers;
  collection.add(disposer);
  return () => collection.delete(disposer);
}

function runDisposers(disposers, context) {
  return Promise.allSettled(disposers.map((dispose) => {
    try {
      // Calling the function before Promise.resolve is intentional: mic
      // tracks, sockets, timers and channels are released synchronously even
      // when pagehide does not allow the browser to await asynchronous work.
      return Promise.resolve(dispose(context));
    } catch (error) {
      return Promise.reject(error);
    }
  }));
}

export function disposeWorkspaceResources({ reason = "workspace-close", final = false } = {}) {
  const state = getState();
  if (state.finalized) return state.finalPromise;

  const context = Object.freeze({ reason: String(reason || "workspace-close"), final: Boolean(final) });
  const disposers = [
    ...state.workspaceDisposers,
    ...(final ? state.windowDisposers : []),
  ];
  if (final) {
    state.finalized = true;
    // Install the promise before invoking callbacks (which may re-enter).
    let finish;
    state.finalPromise = new Promise((resolve) => { finish = resolve; });
    void runDisposers(disposers, context).then((results) => {
      state.workspaceDisposers.clear();
      state.windowDisposers.clear();
      finish(results);
    });
    return state.finalPromise;
  }

  return runDisposers(disposers, context);
}

export function isWorkspaceFinalized() {
  return Boolean(getState().finalized);
}

export function installWorkspaceDisposalLifecycle() {
  const state = getState();
  if (state.lifecycleBound) return;
  state.lifecycleBound = true;

  const disposeFinal = (event) => {
    // A bfcache page is suspended, not destroyed. Its listeners/resources
    // must still work when Back restores it. beforeunload can be cancelled.
    if (event?.persisted) return;
    void disposeWorkspaceResources({
      reason: event?.type || "window-close",
      final: true,
    });
  };

  window.addEventListener("pagehide", disposeFinal);
}
