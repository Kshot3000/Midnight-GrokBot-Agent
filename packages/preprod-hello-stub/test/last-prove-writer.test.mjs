import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { slimProveReport, writeLastProveJson, LAST_PROVE_SCHEMA } from '../src/last-prove-writer.mjs';

describe('last-prove-writer', () => {
  it('slims a multi-step report', () => {
    const slim = slimProveReport({
      claim: 'local ZK',
      ok: true,
      path: 'happy',
      contract: 'agent-escrow',
      proofServer: 'http://127.0.0.1:6300',
      circuitsProved: ['initialize'],
      stepCount: 1,
      steps: [
        {
          circuit: 'initialize',
          role: 'client',
          ok: true,
          preimageBytes: 794,
          checkMs: 11,
          proofBytes: 4508,
          proveMs: 848,
          ledgerState: 0,
          funded: '0',
          released: '0',
          refunded: '0',
        },
      ],
      ledger: { stateAfter: 0 },
      witness: { kind: 'lab', fundedWallet: false, roleSwap: 'activeRole' },
      coverage: { impureWithZkKeys: 12, coveredByNamedPaths: 12, thisPath: ['initialize'], blockedByCoinZswap: [] },
    });
    expect(slim.schemaVersion).toBe(LAST_PROVE_SCHEMA);
    expect(slim.kind).toBe('escrow-local-prove');
    expect(slim.totals.proofBytes).toBe(4508);
    expect(slim.totals.proveMs).toBe(848);
    expect(slim.witness.fundedWallet).toBe(false);
    expect(slim.studioHint).toMatch(/LOCAL prove/);
  });

  it('writes studio + tmp paths', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'last-prove-'));
    const studio = path.join(dir, 'studio-last-prove.json');
    const tmp = path.join(dir, 'tmp-last-prove.json');
    const { slim, written } = writeLastProveJson(
      {
        ok: true,
        path: 'initialize',
        steps: [{ circuit: 'initialize', role: 'client', preimageBytes: 1, proofBytes: 2, proveMs: 3, checkMs: 1 }],
        circuitsProved: ['initialize'],
        witness: { fundedWallet: false },
      },
      { studioPath: studio, tmpPath: tmp, source: 'test' },
    );
    expect(written).toContain(studio);
    expect(written).toContain(tmp);
    expect(JSON.parse(fs.readFileSync(studio, 'utf8')).totals.proofBytes).toBe(2);
    expect(slim.source).toBe('test');
  });
});
