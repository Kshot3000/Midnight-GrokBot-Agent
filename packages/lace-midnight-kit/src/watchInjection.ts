/**
 * Watch for late Lace / Midnight injection on window.midnight.
 * Extensions often inject after first paint — demos should re-probe.
 */

import { discoverProviders, type DiscoverOptions, type DiscoverResult } from './discover.js';

export type InjectionWatchSnapshot = {
  hasMidnight: boolean;
  injectionKeyCount: number;
  injectionKeys: string[];
  discovery: DiscoverResult;
  changed: boolean;
};

export type WatchInjectionOptions = DiscoverOptions & {
  /** Poll interval ms. Default 1500. */
  intervalMs?: number;
  /** Max polls before auto-stop. Default Infinity (until stop()). */
  maxPolls?: number;
  /** Immediate first probe. Default true. */
  immediate?: boolean;
};

export type InjectionWatcher = {
  /** Stop polling. Idempotent. */
  stop: () => void;
  /** Force one probe now. */
  probe: () => InjectionWatchSnapshot;
  /** Whether the watcher is still running. */
  readonly active: boolean;
};

function fingerprint(keys: string[]): string {
  return keys.slice().sort().join('|');
}

/**
 * Poll `window.midnight` and invoke `onChange` when keys / provider count change.
 * Browser-only. Does not call connect.
 */
export function watchMidnightInjection(
  onChange: (snap: InjectionWatchSnapshot) => void,
  options: WatchInjectionOptions = {},
): InjectionWatcher {
  const intervalMs = options.intervalMs ?? 1500;
  const maxPolls = options.maxPolls ?? Number.POSITIVE_INFINITY;
  const immediate = options.immediate !== false;

  let lastFp = '';
  let polls = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let active = true;

  const probe = (): InjectionWatchSnapshot => {
    const hasWindow = typeof window !== 'undefined';
    const midnight = hasWindow ? window.midnight : undefined;
    const injectionKeys = midnight ? Object.keys(midnight) : [];
    const discovery = hasWindow
      ? discoverProviders({
          apiVersionRange:
            options.apiVersionRange === undefined ? '^4.0.0' : options.apiVersionRange,
          throwOnDuplicateRdns: false,
        })
      : {
          providers: [],
          compatible: [],
          hasDuplicateRdns: false,
          injectionKeys: [],
        };

    const fp = fingerprint(injectionKeys);
    const changed = fp !== lastFp;
    lastFp = fp;

    return {
      hasMidnight: Boolean(midnight),
      injectionKeyCount: injectionKeys.length,
      injectionKeys,
      discovery,
      changed,
    };
  };

  const tick = (): void => {
    if (!active) return;
    polls += 1;
    const snap = probe();
    if (snap.changed || polls === 1) {
      onChange(snap);
    }
    if (polls >= maxPolls) {
      stop();
    }
  };

  const stop = (): void => {
    active = false;
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
  };

  if (immediate) tick();
  if (active && maxPolls > (immediate ? 1 : 0)) {
    timer = setInterval(tick, intervalMs);
  }

  return {
    stop,
    probe: () => {
      const snap = probe();
      onChange(snap);
      return snap;
    },
    get active() {
      return active;
    },
  };
}
