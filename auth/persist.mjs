/**
 * Local persistence + multi-tab sync for Auth Forge.
 * Uses localStorage + BroadcastChannel (+ storage event fallback).
 * Migrates legacy sk/posts/score keys into schema v2.
 */

import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  LEGACY_SK_KEY,
  LEGACY_POSTS_KEY,
  LEGACY_SCORE_KEY,
  emptyStudioState,
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  normalizeHex64,
} from './auth-core.mjs';

export { STORAGE_KEY, SCHEMA_VERSION };

function readLegacy(ls) {
  if (!ls) return null;
  try {
    const sk = normalizeHex64(ls.getItem(LEGACY_SK_KEY));
    let posts = [];
    let score = {};
    const postsRaw = ls.getItem(LEGACY_POSTS_KEY);
    if (postsRaw) {
      const parsed = JSON.parse(postsRaw);
      if (Array.isArray(parsed)) posts = parsed;
    }
    const scoreRaw = ls.getItem(LEGACY_SCORE_KEY);
    if (scoreRaw) {
      const parsed = JSON.parse(scoreRaw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) score = parsed;
    }
    if (!sk && !posts.length && !Object.keys(score).length) return null;
    return normalizeStudioState({ sk, posts, score });
  } catch {
    return null;
  }
}

function clearLegacy(ls) {
  if (!ls) return;
  try {
    ls.removeItem(LEGACY_SK_KEY);
    ls.removeItem(LEGACY_POSTS_KEY);
    ls.removeItem(LEGACY_SCORE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadStudioState(storageKey = STORAGE_KEY, storage) {
  const ls = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!ls) return emptyStudioState();
  try {
    const raw = ls.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return normalizeStudioState({ posts: parsed });
      return normalizeStudioState(parsed);
    }
    const legacy = readLegacy(ls);
    if (legacy) {
      // Persist upgraded shape; drop legacy keys so we don't double-read.
      try {
        ls.setItem(storageKey, JSON.stringify({ ...legacy, schemaVersion: SCHEMA_VERSION }));
        clearLegacy(ls);
      } catch {
        /* quota */
      }
      return legacy;
    }
    return emptyStudioState();
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
    clearLegacy(ls);
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
      clearLegacy(ls);
    } catch {
      /* ignore */
    }
  }
  return emptyStudioState();
}

export function exportStudioJSON(state) {
  return JSON.stringify(buildExportDocument(state), null, 2);
}

export function importStudioJSON(text) {
  return parseImportDocument(text);
}

const CHANNEL_NAME = 'mn-auth-lab-sync';

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
        ? normalizeStudioState({ posts: parsed })
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
