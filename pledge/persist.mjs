/**
 * Local persistence + multi-tab sync.
 * Uses localStorage + BroadcastChannel (+ storage event fallback).
 */

import {
  STORAGE_KEY,
  DRAFT_KEY,
  SCHEMA_VERSION,
  emptyStudioState,
  normalizeStudioState,
  normalizeDraft,
  buildExportDocument,
  parseImportDocument,
} from './pledge-core.mjs';

export { STORAGE_KEY, DRAFT_KEY, SCHEMA_VERSION };

export function loadStudioState(storageKey = STORAGE_KEY, storage) {
  const ls = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!ls) return emptyStudioState();
  try {
    const raw = ls.getItem(storageKey);
    if (!raw) return emptyStudioState();
    const parsed = JSON.parse(raw);
    // Migrate legacy bare-array blobs
    if (Array.isArray(parsed)) {
      return normalizeStudioState({ pledges: parsed });
    }
    return normalizeStudioState(parsed);
  } catch {
    return emptyStudioState();
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

export function clearStudioState(storageKey = STORAGE_KEY, storage) {
  const ls = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (ls) {
    try {
      ls.removeItem(storageKey);
      ls.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }
  return emptyStudioState();
}

export function loadDraft(storage) {
  const ls = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!ls) return null;
  try {
    const raw = ls.getItem(DRAFT_KEY);
    // Never hand the renderer a verbatim blob: a non-numeric amount in a
    // stored draft crashed renderDraftPreview and broke the whole board.
    return raw ? normalizeDraft(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft, storage) {
  const ls = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!ls) return;
  try {
    if (draft) ls.setItem(DRAFT_KEY, JSON.stringify(draft));
    else ls.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function exportStudioJSON(state) {
  return JSON.stringify(buildExportDocument(state), null, 2);
}

export function importStudioJSON(text) {
  return parseImportDocument(text);
}

const CHANNEL_NAME = 'mn-veil-pledge-sync';

/**
 * Multi-tab sync. onRemote(state) when another tab writes.
 * Returns { broadcast(state), stop() }.
 */
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
      const parsed = JSON.parse(ev.newValue);
      const state = Array.isArray(parsed)
        ? normalizeStudioState({ pledges: parsed })
        : normalizeStudioState(parsed);
      onRemote?.(state, { source: 'storage' });
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
