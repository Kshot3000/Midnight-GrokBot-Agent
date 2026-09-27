#!/usr/bin/env node
/**
 * CORS prove-bridge for Hello Studio + Agent Escrow Studio.
 * Serves last-prove.json and optionally runs local ZK prove.
 *
 * Port default 6399. Does NOT talk to proof-server from the browser —
 * the bridge (Node) calls proof-server :6300 and returns JSON.
 *
 * LOCAL ZK only — NOT on-chain / NOT Preprod deploy.
 *
 * Endpoints:
 *   GET  /health
 *   GET  /last-prove?contract=escrow|hello
 *   POST /prove?path=initialize|happy|…|all          (escrow)
 *   POST /prove?contract=hello                      (hello increment)
 *   OPTIONS *
 *
 * Env:
 *   PROVE_BRIDGE_PORT (6399)
 *   PROVE_BRIDGE_HOST (127.0.0.1)
 *   PROVE_BRIDGE_TIMEOUT_MS (180000) — soft-fail on timeout
 *   PROVE_BRIDGE_HEALTH_TIMEOUT_MS (2500)
 *   LAST_PROVE_PATH / HELLO_LAST_PROVE_PATH
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PROVE_BRIDGE_PORT || 6399);
const HOST = process.env.PROVE_BRIDGE_HOST || '127.0.0.1';
const PROVE_TIMEOUT_MS = Number(process.env.PROVE_BRIDGE_TIMEOUT_MS || 180_000);
const HEALTH_TIMEOUT_MS = Number(process.env.PROVE_BRIDGE_HEALTH_TIMEOUT_MS || 2500);
const PROOF_SERVER_URL =
  process.env.MIDNIGHT_PROOF_SERVER || 'http://127.0.0.1:6300';

const ESCROW_LAST_PROVE =
  process.env.LAST_PROVE_PATH || path.join(__dirname, 'last-prove.json');
const HELLO_LAST_PROVE =
  process.env.HELLO_LAST_PROVE_PATH ||
  path.join(__dirname, '../hello-studio/last-prove.json');

const REPO_ROOT = path.resolve(__dirname, '../..');
const ESCROW_PROVE_MODULE = path.join(
  REPO_ROOT,
  'packages/preprod-hello-stub/src/prove-escrow-local.mjs',
);
const HELLO_PROVE_MODULE = path.join(
  REPO_ROOT,
  'packages/preprod-hello-stub/src/prove-hello-local.mjs',
);
const WRITER_MODULE = path.join(
  REPO_ROOT,
  'packages/preprod-hello-stub/src/last-prove-writer.mjs',
);

const HUB_DEEP_LINKS = Object.freeze({
  helloStudio: '/hello/#local-prove',
  escrowStudio: '/escrow/#local-prove',
  hubPreprod: '/#preprod',
  localHello: 'http://127.0.0.1:5187/#local-prove',
  localEscrow: 'http://127.0.0.1:5175/#local-prove',
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '600',
};

function send(res, status, body, extraHeaders = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...CORS,
    ...extraHeaders,
  });
  res.end(payload);
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${label || 'operation'} timed out after ${ms}ms`);
      err.code = 'PROVE_TIMEOUT';
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function softProbeProofServer() {
  const healthUrl = `${PROOF_SERVER_URL.replace(/\/$/, '')}/health`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const res = await fetch(healthUrl, { signal: controller.signal });
    const body = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      body: body.slice(0, 200),
      url: healthUrl,
    };
  } catch (e) {
    return {
      ok: false,
      status: null,
      body: String(e?.message || e),
      url: healthUrl,
      softFail: true,
    };
  } finally {
    clearTimeout(timer);
  }
}

let proving = false;

async function runEscrowProve(pathName) {
  const { proveEscrowMultiLocal, proveEscrowAllPathsLocal } = await import(
    pathToFileURL(ESCROW_PROVE_MODULE).href
  );
  const { writeLastProveJson } = await import(pathToFileURL(WRITER_MODULE).href);

  if (pathName === 'all') {
    const report = await proveEscrowAllPathsLocal();
    const { slim } = writeLastProveJson(report, {
      source: 'prove-bridge:/prove?path=all',
      studioPath: ESCROW_LAST_PROVE,
    });
    return slim;
  }

  const report = await proveEscrowMultiLocal({ path: pathName });
  const { slim } = writeLastProveJson(report, {
    source: `prove-bridge:/prove?path=${pathName}`,
    studioPath: ESCROW_LAST_PROVE,
  });
  return slim;
}

async function runHelloProve() {
  const { proveHelloLocal } = await import(pathToFileURL(HELLO_PROVE_MODULE).href);
  const { writeLastProveJson } = await import(pathToFileURL(WRITER_MODULE).href);
  const report = await proveHelloLocal({ timeout: PROVE_TIMEOUT_MS });
  const { slim } = writeLastProveJson(report, {
    source: 'prove-bridge:/prove?contract=hello',
    kind: 'hello',
    studioPath: HELLO_LAST_PROVE,
  });
  return slim;
}

function resolveContract(url) {
  const c = (url.searchParams.get('contract') || '').toLowerCase();
  if (c === 'hello' || c === 'hello-midnight') return 'hello';
  if (c === 'escrow' || c === 'agent-escrow') return 'escrow';
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (url.pathname === '/health' && req.method === 'GET') {
    const escrowExists = fs.existsSync(ESCROW_LAST_PROVE);
    const helloExists = fs.existsSync(HELLO_LAST_PROVE);
    const escrowData = escrowExists ? readJsonFile(ESCROW_LAST_PROVE) : null;
    const helloData = helloExists ? readJsonFile(HELLO_LAST_PROVE) : null;
    const proofServer = await softProbeProofServer();
    send(res, 200, {
      ok: true,
      service: 'midnight-prove-bridge',
      claim: 'LOCAL ZK bridge — NOT on-chain',
      port: PORT,
      proving,
      proveTimeoutMs: PROVE_TIMEOUT_MS,
      lastProvePath: ESCROW_LAST_PROVE,
      lastProveExists: escrowExists,
      lastProveWrittenAt: escrowData?.writtenAt || null,
      helloLastProvePath: HELLO_LAST_PROVE,
      helloLastProveExists: helloExists,
      helloLastProveWrittenAt: helloData?.writtenAt || null,
      proofServer,
      hubDeepLinks: HUB_DEEP_LINKS,
      endpoints: [
        'GET /health',
        'GET /last-prove?contract=escrow|hello',
        'POST /prove?path=initialize|happy|cancel|…|all',
        'POST /prove?contract=hello',
      ],
      brand: '@kshot9000',
    });
    return;
  }

  if (url.pathname === '/last-prove' && req.method === 'GET') {
    const contract = resolveContract(url) || 'escrow';
    const filePath = contract === 'hello' ? HELLO_LAST_PROVE : ESCROW_LAST_PROVE;
    const data = readJsonFile(filePath);
    if (!data) {
      send(res, 404, {
        ok: false,
        contract,
        error:
          contract === 'hello'
            ? 'No hello last-prove.json — run npm run prove:hello-local or POST /prove?contract=hello'
            : 'No last-prove.json — run npm run prove:escrow-local or POST /prove?path=…',
        softFail: true,
      });
      return;
    }
    send(res, 200, data);
    return;
  }

  if (url.pathname === '/prove' && req.method === 'POST') {
    if (proving) {
      send(res, 409, { ok: false, error: 'Prove already in progress', softFail: true });
      return;
    }
    const contract = resolveContract(url);
    const pathName = url.searchParams.get('path') || 'initialize';
    proving = true;
    try {
      const slim =
        contract === 'hello'
          ? await withTimeout(runHelloProve(), PROVE_TIMEOUT_MS, 'hello prove')
          : await withTimeout(runEscrowProve(pathName), PROVE_TIMEOUT_MS, `escrow prove path=${pathName}`);
      send(res, 200, { ok: true, report: slim });
    } catch (e) {
      const code =
        e?.code === 'PROOF_SERVER_DOWN'
          ? 503
          : e?.code === 'PROVE_TIMEOUT'
            ? 504
            : 500;
      send(res, code, {
        ok: false,
        error: String(e?.message || e),
        code: e?.code || null,
        softFail: true,
        claim: 'LOCAL prove failed — still NOT on-chain',
      });
    } finally {
      proving = false;
    }
    return;
  }

  send(res, 404, {
    ok: false,
    error: 'Not found',
    endpoints: [
      'GET /health',
      'GET /last-prove?contract=escrow|hello',
      'POST /prove?path=initialize|happy|…',
      'POST /prove?contract=hello',
    ],
    hubDeepLinks: HUB_DEEP_LINKS,
  });
});

server.listen(PORT, HOST, () => {
  console.log(`midnight prove-bridge · http://${HOST}:${PORT}`);
  console.log(`  GET  /health`);
  console.log(`  GET  /last-prove?contract=escrow|hello`);
  console.log(`  POST /prove?path=initialize|happy|cancel|…`);
  console.log(`  POST /prove?contract=hello`);
  console.log(`  timeout: ${PROVE_TIMEOUT_MS}ms · soft-fail on flake`);
  console.log(`  hub: ${HUB_DEEP_LINKS.helloStudio} · ${HUB_DEEP_LINKS.escrowStudio}`);
  console.log(`  claim: LOCAL ZK only — NOT a Preprod deploy`);
  console.log(`  brand: @kshot9000`);
});
