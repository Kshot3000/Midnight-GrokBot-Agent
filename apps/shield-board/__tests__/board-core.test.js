import { describe, expect, it } from 'vitest';
import {
  bytesToHex,
  hexToBytes,
  short,
  escapeHtml,
  postStats,
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  derivePk,
  commitmentOf,
  isOwner,
  EXPORT_KIND,
  SCHEMA_VERSION,
} from '../board-core.mjs';

describe('hex helpers', () => {
  it('bytes ↔ hex', () => {
    const b = new Uint8Array([0x0a, 0xff]);
    expect(bytesToHex(b)).toBe('0aff');
    expect([...hexToBytes('0aff')]).toEqual([10, 255]);
  });

  it('short + escapeHtml', () => {
    expect(short('abcdefghijklmnop', 4)).toMatch(/…/);
    expect(escapeHtml('<a & "b">')).toBe('&lt;a &amp; &quot;b&quot;&gt;');
  });
});

describe('postStats + owner', () => {
  it('counts sealed/disclosed', () => {
    expect(postStats([{ disclosed: false }, { disclosed: true }, { disclosed: false }])).toEqual({
      posts: 3,
      sealed: 2,
      disclosed: 1,
    });
  });

  it('isOwner', () => {
    expect(isOwner({ ownerPk: 'abc' }, 'abc')).toBe(true);
    expect(isOwner({ ownerPk: 'abc' }, 'zzz')).toBe(false);
  });
});

describe('crypto with injectable digest', () => {
  it('derivePk + commitmentOf deterministic', async () => {
    const digest = async (bytes) => {
      // stable FNV-1a-ish over all bytes → 64 hex chars
      const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      let h = 2166136261;
      for (let i = 0; i < arr.length; i++) {
        h ^= arr[i];
        h = Math.imul(h, 16777619);
      }
      let out = (h >>> 0).toString(16).padStart(8, '0');
      // mix length + rolling so different seq/body diverge
      let h2 = 0;
      for (let i = 0; i < arr.length; i++) h2 = (h2 + arr[i] * (i + 1)) >>> 0;
      out += h2.toString(16).padStart(8, '0') + arr.length.toString(16).padStart(8, '0');
      return out.padEnd(64, 'a');
    };
    const secret = 'aa'.repeat(32);
    const pk1 = await derivePk(secret, digest);
    const pk2 = await derivePk(secret, digest);
    expect(pk1).toBe(pk2);
    const c1 = await commitmentOf('hello', pk1, 0, digest);
    const c2 = await commitmentOf('hello', pk1, 0, digest);
    const c3 = await commitmentOf('hello', pk1, 1, digest);
    expect(c1).toBe(c2);
    expect(c1).not.toBe(c3);
  });
});

describe('normalize + export/import', () => {
  it('round-trips', () => {
    const state = normalizeStudioState({
      secret: 'abc',
      seq: 2,
      posts: [{ id: 'p1', commitment: 'c', ownerPk: 'pk', seq: 0, createdAt: 1, disclosed: false, body: 'hi' }],
      log: ['ok'],
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.posts[0].body).toBe('hi');
  });

  it('rejects garbage', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument({}).ok).toBe(false);
  });
});
