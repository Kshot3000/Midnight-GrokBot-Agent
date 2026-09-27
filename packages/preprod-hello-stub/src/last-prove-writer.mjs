/**
 * Persist a slim, Studio-friendly last-prove JSON after local escrow prove.
 * LOCAL ZK only — NOT on-chain / NOT Preprod deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, '../../..');

/** Primary path Studio can fetch via python -m http.server in agent-escrow-stub. */
export const LAST_PROVE_STUDIO_PATH = path.join(
  REPO_ROOT,
  'apps/agent-escrow-stub/last-prove.json',
);

/** Machine-local fallback (always writable). */
export const LAST_PROVE_TMP_PATH = '/tmp/midnight-escrow-last-prove.json';

export const LAST_PROVE_SCHEMA = 1;

/**
 * Slim a full proveEscrowMultiLocal / all-paths report for UI consumption.
 * @param {object} report
 * @param {{ source?: string, writtenAt?: string }} [meta]
 */
export function slimProveReport(report, meta = {}) {
  if (!report || typeof report !== 'object') {
    throw new Error('slimProveReport: report required');
  }

  const isAllPaths = Array.isArray(report.paths) && !Array.isArray(report.steps);
  const writtenAt = meta.writtenAt || new Date().toISOString();
  const source = meta.source || 'prove:escrow-local';

  if (isAllPaths) {
    return {
      schemaVersion: LAST_PROVE_SCHEMA,
      kind: 'escrow-local-prove-all',
      claim: report.claim || 'local ZK all-paths prove — NOT a Preprod deploy',
      writtenAt,
      source,
      ok: Boolean(report.ok),
      path: 'all',
      paths: (report.paths || []).map((p) => ({
        path: p.path,
        stepCount: p.stepCount,
        circuitsProved: p.circuitsProved,
        totalProveMs: p.totalProveMs,
      })),
      circuitsCovered: report.circuitsCovered || [],
      coveredCount: report.coveredCount ?? null,
      expectedImpure: report.expectedImpure ?? null,
      allImpureCovered: Boolean(report.allImpureCovered),
      witness: { fundedWallet: false, ...(report.witness || {}) },
      studioHint:
        'LOCAL prove ≠ on-chain. Agent Escrow Studio → Load last local prove / prove-bridge :6399.',
    };
  }

  const steps = Array.isArray(report.steps)
    ? report.steps.map((s) => ({
        circuit: s.circuit,
        role: s.role,
        ok: s.ok !== false,
        preimageBytes: s.preimageBytes ?? null,
        checkMs: s.checkMs ?? null,
        proofBytes: s.proofBytes ?? null,
        proveMs: s.proveMs ?? null,
        ledgerState: s.ledgerState ?? null,
        funded: s.funded ?? null,
        released: s.released ?? null,
        refunded: s.refunded ?? null,
      }))
    : [];

  const totalProveMs = steps.reduce((a, s) => a + (Number(s.proveMs) || 0), 0);
  const totalCheckMs = steps.reduce((a, s) => a + (Number(s.checkMs) || 0), 0);
  const totalProofBytes = steps.reduce((a, s) => a + (Number(s.proofBytes) || 0), 0);
  const totalPreimageBytes = steps.reduce((a, s) => a + (Number(s.preimageBytes) || 0), 0);

  return {
    schemaVersion: LAST_PROVE_SCHEMA,
    kind: 'escrow-local-prove',
    claim: report.claim || 'local ZK multi-circuit prove — NOT a Preprod deploy',
    writtenAt,
    source,
    ok: Boolean(report.ok),
    path: report.path || null,
    contract: report.contract || 'agent-escrow',
    proofServer: report.proofServer || null,
    health: report.health || null,
    circuitsProved: report.circuitsProved || steps.map((s) => s.circuit),
    stepCount: report.stepCount ?? steps.length,
    steps,
    totals: {
      proveMs: totalProveMs,
      checkMs: totalCheckMs,
      proofBytes: totalProofBytes,
      preimageBytes: totalPreimageBytes,
    },
    ledger: report.ledger || null,
    witness: {
      fundedWallet: false,
      kind: report.witness?.kind || 'synthetic lab RNG',
      roleSwap: report.witness?.roleSwap || null,
      note: report.witness?.note || 'NOT Lace / NOT Preprod seed',
    },
    coverage: report.coverage
      ? {
          impureWithZkKeys: report.coverage.impureWithZkKeys,
          coveredByNamedPaths: report.coverage.coveredByNamedPaths,
          thisPath: report.coverage.thisPath,
          blockedByCoinZswap: report.coverage.blockedByCoinZswap || [],
        }
      : null,
    studioHint:
      'LOCAL prove ≠ on-chain. Agent Escrow Studio → Load last local prove / prove-bridge :6399.',
  };
}

/**
 * Write slim report to Studio path + /tmp. Returns { studioPath, tmpPath, slim }.
 * @param {object} report
 * @param {{ source?: string, studioPath?: string, tmpPath?: string }} [opts]
 */
export function writeLastProveJson(report, opts = {}) {
  const slim = slimProveReport(report, { source: opts.source });
  const studioPath = opts.studioPath || LAST_PROVE_STUDIO_PATH;
  const tmpPath = opts.tmpPath || LAST_PROVE_TMP_PATH;
  const body = JSON.stringify(slim, null, 2) + '\n';

  const written = [];
  for (const target of [studioPath, tmpPath]) {
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, body, 'utf8');
      written.push(target);
    } catch (e) {
      // Studio path may be read-only in some CI; /tmp should still work.
      if (target === tmpPath) throw e;
    }
  }

  return { slim, studioPath, tmpPath, written };
}
