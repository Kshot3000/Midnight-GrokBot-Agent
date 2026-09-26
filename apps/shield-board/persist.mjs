/**
 * Local persistence + multi-tab sync for Shield Board.
 * Uses localStorage + BroadcastChannel (+ storage event fallback).
 * Migrates legacy shield-board:dual:v1 blobs into schema v2.
 */

import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  SCHEMA_VERSION,
  emptyStudioState,
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
} from './board-core.mjs';

export { STORAGE_KEY, SCHEMA_VERSION, LEGACY_STORAGE_KEY };

export function loadStudioState(storageKey = STORAGE_KEY, storage, options = {}) {
  const ls = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!ls) return emptyStudioState(options.seedSecret || null);
  try {
    let raw = ls.getItem(storageKey);
    if (!raw && options.legacyKey !== false) {
      const legacyKey = options.legacyKey || LEGACY_STORAGE_KEY;
      raw = ls.getItem(legacyKey);
      if (raw) {
        const migrated = normalizeStudioState(JSON.parse(raw));
        migrated.updatedAt = new Date().toISOString();
        try {
          ls.setItem(storageKey, JSON.stringify(migrated));
        } catch {
          /* ignore */
        }
        return migrated;
      }
    }
    if (!raw) return emptyStudioState(options.seedSecret || null);
    return normalizeStudioState(JSON.parse(raw));
  } catch {
    return emptyStudioState(options.seedSecret || null);
  }
}

export function saveStudioState(state, storageKey = STORAGE_KEY, storage) {
  const ls = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!ls) return normalizeStudioState(state);
  const normalized = normalizeStudioState(state);
  normalized.updatedAt = new Date().toISOString();
  normalized.schemaVersion = SCHEMA_VERSION;
  try {
    ls.setItem(storageKey, JSON.stringify(normalized));
  } catch {
    /* quota / private mode */
  }
  return normalized;
}

export function clearStudioState(storageKey = STORAGE_KEY, storage, options = {}) {
  const ls = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (ls) {
    try {
      ls.removeItem(storageKey);
      const legacyKey = options.legacyKey || LEGACY_STORAGE_KEY;
      if (legacyKey) ls.removeItem(legacyKey);
    } catch {
      /* ignore */
    }
  }
  return emptyStudioState(options.seedSecret || null);
}

export function exportStudioJSON(state) {
  return JSON.stringify(buildExportDocument(state), null, 2);
}

export function importStudioJSON(text) {
  return parseImportDocument(text);
}

const CHANNEL_NAME = 'mn-shield-board-sync';

export function createTabSync(options = {}) {
  const storageKey = options.storageKey ?? STORAGE_KEY;
  const onRemote = options.onRemote;
  const tabId =
    options.tabId ||
    `tab-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

  let channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
    }
  } catch {
    channel = null;
  }

  const handleMessage = (msg) => {
    if (!msg || msg.tabId === tabId) return;
    if (msg.type !== 'state' || !msg.state) return;
    onRemote?.(normalizeStudioState(msg.state), { source: 'broadcast', tabId: msg.tabId });
  };

  if (channel) {
    channel.onmessage = (ev) => handleMessage(ev.data);
  }

  const onStorage = (ev) => {
    if (ev.key !== storageKey || ev.storageArea !== localStorage) return;
    if (!ev.newValue) {
      onRemote?.(emptyStudioState(), { source: 'storage-clear' });
      return;
    }
    try {
      onRemote?.(normalizeStudioState(JSON.parse(ev.newValue)), { source: 'storage' });
    } catch {
      /* ignore */
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return {
    tabId,
    broadcast(state) {
      const payload = {
        type: 'state',
        tabId,
        at: new Date().toISOString(),
        state: normalizeStudioState(state),
      };
      try {
        channel?.postMessage(payload);
      } catch {
        /* ignore */
      }
    },
    stop() {
      try {
        channel?.close();
      } catch {
        /* ignore */
      }
      channel = null;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    },
  };
}
