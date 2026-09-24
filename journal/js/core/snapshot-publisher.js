// Suppress identical state messages, not polling, commands or liveness probes.
// Timestamp-only changes do not represent UI changes. Heartbeats still force
// a send so peer tabs can discover this tab and refresh its liveness timestamp.
export function createSnapshotPublisher(send) {
  let lastSignature = '';
  return {
    publish(snapshot, reason, { force = false } = {}) {
      const { updatedAt, ...content } = snapshot;
      const signature = JSON.stringify(content);
      if (!force && signature === lastSignature) return false;
      if (send({ type: 'mini-hub-tab-state', reason, snapshot }) === false) return false;
      lastSignature = signature;
      return true;
    },
    reset() { lastSignature = ''; },
  };
}
