/**
 * Poll getConnectionStatus() on a live ConnectedAPI.
 * Stops itself on disconnect / fatal errors when configured.
 */

import type { ConnectionStatus } from '@midnight-ntwrk/dapp-connector-api';
import type { ConnectedSession } from './connect.js';
import { normalizeConnectorError } from './errors.js';
import { isDemoSession } from './demoMode.js';

export type ConnectionHealthSnapshot = {
  ok: boolean;
  status: ConnectionStatus | null;
  errorMessage: string | null;
  polledAt: string;
};

export type WatchConnectionOptions = {
  intervalMs?: number;
  /** Stop watcher when status becomes disconnected. Default true. */
  stopOnDisconnect?: boolean;
  immediate?: boolean;
};

export type ConnectionHealthWatcher = {
  stop: () => void;
  probe: () => Promise<ConnectionHealthSnapshot>;
  readonly active: boolean;
};

/**
 * Watch connection health for a real session. No-op / throws for demo sessions.
 */
export function watchConnectionStatus(
  session: ConnectedSession,
  onChange: (snap: ConnectionHealthSnapshot) => void,
  options: WatchConnectionOptions = {},
): ConnectionHealthWatcher {
  if (isDemoSession(session)) {
    const snap: ConnectionHealthSnapshot = {
      ok: false,
      status: null,
      errorMessage: 'Demo session — no live health watch',
      polledAt: new Date().toISOString(),
    };
    onChange(snap);
    return {
      stop: () => {},
      probe: async () => snap,
      get active() {
        return false;
      },
    };
  }

  const intervalMs = options.intervalMs ?? 4000;
  const stopOnDisconnect = options.stopOnDisconnect !== false;
  const immediate = options.immediate !== false;
  let active = true;
  let timer: ReturnType<typeof setInterval> | null = null;

  const probe = async (): Promise<ConnectionHealthSnapshot> => {
    const polledAt = new Date().toISOString();
    try {
      const status = await session.api.getConnectionStatus();
      const ok = status.status === 'connected';
      const snap: ConnectionHealthSnapshot = {
        ok,
        status,
        errorMessage: ok ? null : `status=${status.status}`,
        polledAt,
      };
      onChange(snap);
      if (!ok && stopOnDisconnect) stop();
      return snap;
    } catch (err) {
      const e = normalizeConnectorError(err);
      const snap: ConnectionHealthSnapshot = {
        ok: false,
        status: null,
        errorMessage: e.message,
        polledAt,
      };
      onChange(snap);
      if (stopOnDisconnect) stop();
      return snap;
    }
  };

  const stop = (): void => {
    active = false;
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const tick = (): void => {
    if (!active) return;
    void probe();
  };

  if (immediate) tick();
  if (active) timer = setInterval(tick, intervalMs);

  return {
    stop,
    probe,
    get active() {
      return active;
    },
  };
}
