#!/usr/bin/env node
/**
 * Root consumer DX smoke: health + hello prove + escrow initialize.
 *
 * Soft-fails (exit 0) when proof-server :6300 is down — clear message, no fake deploy claim.
 * Soft-fails when artifacts missing (compile first). Hard-fails only on unexpected prove errors.
 *
 * Usage (repo root, Node 22+):
 *   npm run smoke:local-prove
 *
 * NOT a Preprod deploy. NOT on-chain.
 */
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PROOF_URL = (process.env.MIDNIGHT_PROOF_SERVER || 'http://127.0.0.1:6300').replace(/\/$/, '');
const BRIDGE_URL = (process.env.PROVE_BRIDGE_URL || 'http://127.0.0.1:6399').replace(/\/$/, '');
const HEALTH_TIMEOUT_MS = Number(process.env.SMOKE_HEALTH_TIMEOUT_MS || 5000);

const BRAND = {
  donate:
    'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  x: '@kshot9000',
};

function hr(char = '─') {
  return char.repeat(64);
}

function banner() {
  console.log(hr('═'));
  console.log('  smoke:local-prove · consumer DX');
  console.log('  local ZK only — NOT a Preprod deploy / NOT on-chain');
  console.log(hr('═'));
}

function section(label) {
  console.log(`\n▸ ${label}`);
}

function kv(key, value) {
  console.log(`  ${String(key).padEnd(18)} ${value}`);
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function warn(msg) {
  console.error(`  ! ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
}

function brandLine() {
  console.log(`\n  Brand · donate ${BRAND.donate}`);
  console.log(`         ${BRAND.x}`);
}

async function probeHealth(baseUrl, label) {
  const url = `${baseUrl}/health`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) });
    const raw = await res.text();
    let claim = null;
    try {
      const j = JSON.parse(raw);
      claim = j.claim || j.status || null;
    } catch {
      /* plain text ok */
    }
    return {
      label,
      url,
      ok: res.ok,
      status: res.status,
      body: raw.slice(0, 240),
      claim,
      softFail: !res.ok,
    };
  } catch (e) {
    return {
      label,
      url,
      ok: false,
      status: 0,
      body: String(e?.message || e),
      claim: null,
      softFail: true,
    };
  }
}

function parseJsonPrefix(stdout) {
  const start = stdout.indexOf('{');
  if (start < 0) throw new Error('no JSON object in artifacts:list output');
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < stdout.length; i++) {
    const c = stdout[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return JSON.parse(stdout.slice(start, i + 1));
    }
  }
  throw new Error('unterminated JSON in artifacts:list output');
}

function runArtifactsList() {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'contracts/list-compiled-artifacts.mjs')], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  // inventory script always exits 0; presence is in JSON (brand line follows)
  try {
    const json = parseJsonPrefix(r.stdout || '');
    const helloPresent = Boolean(json?.hello?.present);
    const escrowPresent = Boolean(json?.escrow?.present);
    return {
      ok: helloPresent && escrowPresent,
      softFail: !(helloPresent && escrowPresent),
      helloPresent,
      escrowPresent,
      helloCircuits: json?.hello?.circuits || [],
      escrowCircuits: json?.escrow?.circuits || [],
      claim: json?.claim,
    };
  } catch (e) {
    return { ok: false, softFail: false, stderr: String(e?.message || e) + ' · ' + (r.stderr || '').slice(0, 200) };
  }
}

async function main() {
  banner();
  const report = {
    claim: 'local smoke — NOT a Preprod deploy / NOT on-chain',
    brand: BRAND,
    softFail: false,
    reasons: [],
    health: {},
    artifacts: null,
    hello: null,
    escrow: null,
    bridge: null,
  };

  section('1 · Artifact inventory');
  const arts = runArtifactsList();
  report.artifacts = arts;
  if (!arts.ok) {
    if (arts.softFail) {
      report.softFail = true;
      report.reasons.push('compiled artifacts missing');
      warn(
        `artifacts soft-fail — hello=${arts.helloPresent} escrow=${arts.escrowPresent}`,
      );
      warn('Compile: npm run compact:hello && npm run compact:escrow');
      warn('Or inspect: npm run artifacts:list');
      brandLine();
      console.log('\n' + JSON.stringify({ ...report, exit: 0, softFail: true }, null, 2));
      process.exit(0);
    }
    fail(`artifacts:list failed: ${arts.stderr || 'unknown'}`);
    brandLine();
    process.exit(1);
  }
  ok(`hello circuits: ${(arts.helloCircuits || []).join(',') || 'present'}`);
  ok(`escrow circuits: ${(arts.escrowCircuits || []).length} impure keys`);
  kv('hint', 'npm run artifacts:list');

  section('2 · Health probes');
  const proofHealth = await probeHealth(PROOF_URL, 'proof-server');
  const bridgeHealth = await probeHealth(BRIDGE_URL, 'prove-bridge');
  report.health.proofServer = proofHealth;
  report.health.proveBridge = bridgeHealth;

  if (proofHealth.ok) {
    ok(`proof-server ${PROOF_URL}/health → ${proofHealth.status} (${proofHealth.claim || 'ok'})`);
  } else {
    report.softFail = true;
    report.reasons.push('proof-server down');
    warn(`proof-server unreachable at ${PROOF_URL}/health`);
    warn(`detail: ${proofHealth.body}`);
    warn('Start: npm run proof-server:podman');
    warn('  or: podman run -d --name midnight-proof-server -p 6300:6300 \\');
    warn('      docker.io/midnightntwrk/proof-server:8.1.0 midnight-proof-server -v');
    if (bridgeHealth.ok) {
      ok(`prove-bridge ${BRIDGE_URL}/health still up (optional) — claim: ${bridgeHealth.claim || 'ok'}`);
    } else {
      warn(`prove-bridge also down at ${BRIDGE_URL}/health (optional Studio CORS path)`);
      warn('Start optional: npm run prove-bridge');
    }
    section('Soft-fail');
    warn('Skipping hello + escrow prove — proof-server required for local ZK.');
    warn('This is NOT a Preprod / on-chain failure. Re-run when :6300 is healthy.');
    brandLine();
    console.log('\n' + JSON.stringify({ ...report, exit: 0, softFail: true }, null, 2));
    process.exit(0);
  }

  if (bridgeHealth.ok) {
    ok(`prove-bridge ${BRIDGE_URL}/health → ${bridgeHealth.status} (${bridgeHealth.claim || 'ok'})`);
    report.bridge = { ok: true, claim: bridgeHealth.claim };
  } else {
    warn(`prove-bridge soft-miss at ${BRIDGE_URL}/health — Studio CORS optional`);
    warn(`detail: ${bridgeHealth.body}`);
    warn('Optional: npm run prove-bridge');
    report.bridge = { ok: false, softFail: true, detail: bridgeHealth.body };
  }

  section('3 · Hello local prove (increment)');
  kv('script', 'npm run prove:hello-local');
  try {
    const { proveHelloLocal } = await import(
      pathToFileURL(path.join(ROOT, 'packages/preprod-hello-stub/src/prove-hello-local.mjs')).href
    );
    const hello = await proveHelloLocal({ proofUrl: PROOF_URL });
    report.hello = {
      ok: true,
      circuit: hello.circuit || 'increment',
      proofBytes: hello.proofBytes,
      proveMs: hello.proveMs,
      greetings: hello.greetings,
    };
    ok(`hello prove ${hello.proofBytes} B · ${hello.proveMs} ms · greetings ${hello.greetings?.before}→${hello.greetings?.after}`);
  } catch (e) {
    if (e?.code === 'PROOF_SERVER_DOWN') {
      report.softFail = true;
      report.reasons.push('proof-server down during hello prove');
      warn(e.message);
      warn('Soft-fail — start proof-server then re-run npm run smoke:local-prove');
      brandLine();
      console.log('\n' + JSON.stringify({ ...report, exit: 0, softFail: true }, null, 2));
      process.exit(0);
    }
    fail(`hello prove failed: ${e?.message || e}`);
    if (e?.stack) console.error(e.stack);
    brandLine();
    process.exit(1);
  }

  section('4 · Escrow local prove (path=initialize)');
  kv('script', 'npm run prove:escrow-local -- --path=initialize');
  kv('note', 'smoke uses initialize only (fast); full happy/all paths in ARTIFACT-CONSUMERS.md');
  try {
    const { proveEscrowMultiLocal } = await import(
      pathToFileURL(path.join(ROOT, 'packages/preprod-hello-stub/src/prove-escrow-local.mjs')).href
    );
    const escrow = await proveEscrowMultiLocal({ path: 'initialize', proofUrl: PROOF_URL });
    const step0 = escrow.steps?.[0];
    report.escrow = {
      ok: true,
      path: escrow.path,
      stepCount: escrow.stepCount,
      circuitsProved: escrow.circuitsProved,
      proofBytes: step0?.proofBytes,
      proveMs: step0?.proveMs,
      ledgerState: escrow.ledger?.stateAfter,
    };
    ok(
      `escrow path=${escrow.path} · ${escrow.circuitsProved?.join('→')} · proof=${step0?.proofBytes} B · ${step0?.proveMs} ms`,
    );
  } catch (e) {
    if (e?.code === 'PROOF_SERVER_DOWN') {
      report.softFail = true;
      report.reasons.push('proof-server down during escrow prove');
      warn(e.message);
      warn('Soft-fail — start proof-server then re-run npm run smoke:local-prove');
      brandLine();
      console.log('\n' + JSON.stringify({ ...report, exit: 0, softFail: true }, null, 2));
      process.exit(0);
    }
    fail(`escrow initialize prove failed: ${e?.message || e}`);
    if (e?.stack) console.error(e.stack);
    brandLine();
    process.exit(1);
  }

  section('Result');
  ok('smoke:local-prove passed (local ZK only)');
  kv('next', 'npm run prove:escrow-local  # happy lifecycle');
  kv('next', 'npm run prove:escrow-all    # all 12 impure');
  kv('next', 'npm run prove-bridge       # Studio CORS :6399');
  kv('docs', 'contracts/ARTIFACT-CONSUMERS.md');
  brandLine();
  console.log('\n' + JSON.stringify({ ...report, exit: 0, softFail: false }, null, 2));
  process.exit(0);
}

main().catch((e) => {
  fail(String(e?.message || e));
  if (e?.stack) console.error(e.stack);
  brandLine();
  process.exit(1);
});
