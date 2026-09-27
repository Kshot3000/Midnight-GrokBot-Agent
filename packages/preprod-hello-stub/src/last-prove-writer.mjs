/**
 * Persist a slim, Studio-friendly last-prove JSON after local ZK prove.
 * Supports hello (increment) and agent-escrow multi-circuit reports.
 * LOCAL ZK only — NOT on-chain / NOT Preprod deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, '../../..');

/** Primary path Escrow Studio can fetch via python -m http.server. */
export const LAST_PROVE_STUDIO_PATH = path.join(
  REPO_ROOT,
  'apps/agent-escrow-stub/last-prove.json',
);

/** Primary path Hello Studio can fetch. */
export const HELLO_LAST_PROVE_STUDIO_PATH = path.join(
  REPO_ROOT,
  'apps/hello-studio/last-prove.json',
);

/** Machine-local fallbacks (always writable). */
export const LAST_PROVE_TMP_PATH = '/tmp/midnight-escrow-last-prove.json';
export const HELLO_LAST_PROVE_TMP_PATH = '/tmp/midnight-hello-last-prove.json';

export const LAST_PROVE_SCHEMA = 1;

/**
 * Detect hello local-prove report shape.
 * @param {object} report
 */
export function isHelloProveReport(report) {
  if (!report || typeof report !== 'object') return false;
  if (report.kind === 'hello-local-prove') return true;
  if (report.circuit === 'increment' && report.greetings) return true;
  return false;
}

/**
 * Slim a hello proveHelloLocal report for UI consumption.
 * @param {object} report
 * @param {{ source?: string, writtenAt?: string }} [meta]
 */
export function slimHelloProveReport(report, meta = {}) {
  if (!report || typeof report !== 'object') {
    throw new Error('slimHelloProveReport: report required');
  }
  const writtenAt = meta.writtenAt || new Date().toISOString();
  const source = meta.source || 'prove:hello-local';
  const proofBytes = Number(report.proofBytes) || 0;
  const proveMs = Number(report.proveMs) || 0;
  const checkMs = Number(report.checkMs) || 0;
  const preimageBytes = Number(report.preimageBytes) || 0;

  return {
    schemaVersion: LAST_PROVE_SCHEMA,
    kind: 'hello-local-prove',
    claim: report.claim || 'local ZK prove against proof-server — NOT a Preprod deploy',
    writtenAt,
    source,
    ok: Boolean(report.ok),
    contract: 'hello-midnight',
    circuit: report.circuit || 'increment',
    path: 'increment',
    proofServer: report.proofServer || null,
    health: report.health || null,
    greetings: report.greetings || null,
    circuitsProved: [report.circuit || 'increment'],
    stepCount: 1,
    steps: [
      {
        circuit: report.circuit || 'increment',
        role: 'caller',
        ok: report.ok !== false,
        preimageBytes,
        checkMs,
        proofBytes,
        proveMs,
        ledgerState: report.greetings?.after ?? null,
      },
    ],
    totals: {
      proveMs,
      checkMs,
      proofBytes,
      preimageBytes,
    },
    checkLen: report.checkLen ?? null,
    zkArtifacts: report.zkArtifacts || null,
    witness: {
      fundedWallet: false,
      kind: 'hello lab (no wallet)',
      note: 'NOT Lace / NOT Preprod seed',
    },
    studioHint:
      'LOCAL prove ≠ on-chain. Hello Studio → Load last local prove / prove-bridge :6399 · POST /prove?contract=hello.',
  };
}

/**
 * Slim a full proveEscrowMultiLocal / all-paths report for UI consumption.
 * @param {object} report
 * @param {{ source?: string, writtenAt?: string }} [meta]
 */
export function slimProveReport(report, meta = {}) {
  if (!report || typeof report !== 'object') {
    throw new Error('slimProveReport: report required');
  }

  if (isHelloProveReport(report) && !Array.isArray(report.steps) && !Array.isArray(report.paths)) {
    return slimHelloProveReport(report, meta);
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
 * Hello reports default to hello-studio paths; escrow to agent-escrow-stub.
 * @param {object} report
 * @param {{ source?: string, studioPath?: string, tmpPath?: string, kind?: string }} [opts]
 */
export function writeLastProveJson(report, opts = {}) {
  let slim;
  if (opts.kind === 'hello' || isHelloProveReport(report)) {
    if (report?.kind === 'hello-local-prove' && Array.isArray(report.steps)) {
      slim = {
        ...report,
        schemaVersion: LAST_PROVE_SCHEMA,
        source: opts.source || report.source || 'prove:hello-local',
        writtenAt: new Date().toISOString(),
      };
    } else {
      slim = slimHelloProveReport(report, { source: opts.source });
    }
  } else {
    slim = slimProveReport(report, { source: opts.source });
  }

  const studioPath =
    opts.studioPath ||
    (slim.kind === 'hello-local-prove' ? HELLO_LAST_PROVE_STUDIO_PATH : LAST_PROVE_STUDIO_PATH);
  const tmpPath =
    opts.tmpPath ||
    (slim.kind === 'hello-local-prove' ? HELLO_LAST_PROVE_TMP_PATH : LAST_PROVE_TMP_PATH);
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
