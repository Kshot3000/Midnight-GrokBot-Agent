#!/usr/bin/env node
/**
 * Tiny CORS prove-bridge for Agent Escrow Studio.
 * Serves last-prove.json and optionally runs proveEscrowMultiLocal.
 *
 * Port default 6399. Does NOT talk to proof-server from the browser —
 * the bridge (Node) calls proof-server :6300 and returns JSON.
 *
 * LOCAL ZK only — NOT on-chain / NOT Preprod deploy.
 *
 * Endpoints:
 *   GET  /health
 *   GET  /last-prove
 *   POST /prove?path=initialize|happy|cancel|…
 *   OPTIONS *
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PROVE_BRIDGE_PORT || 6399);
const HOST = process.env.PROVE_BRIDGE_HOST || '127.0.0.1';
const LAST_PROVE_PATH =
  process.env.LAST_PROVE_PATH || path.join(__dirname, 'last-prove.json');
const REPO_ROOT = path.resolve(__dirname, '../..');
const PROVE_MODULE = path.join(
  REPO_ROOT,
  'packages/preprod-hello-stub/src/prove-escrow-local.mjs',
);
const WRITER_MODULE = path.join(
  REPO_ROOT,
  'packages/preprod-hello-stub/src/last-prove-writer.mjs',
);

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

function readLastProve() {
  if (!fs.existsSync(LAST_PROVE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(LAST_PROVE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

let proving = false;

async function runProve(pathName) {
  const { proveEscrowMultiLocal, proveEscrowAllPathsLocal } = await import(
    pathToFileURL(PROVE_MODULE).href
  );
  const { writeLastProveJson } = await import(pathToFileURL(WRITER_MODULE).href);

  if (pathName === 'all') {
    const report = await proveEscrowAllPathsLocal();
    const { slim } = writeLastProveJson(report, {
      source: 'prove-bridge:/prove?path=all',
      studioPath: LAST_PROVE_PATH,
    });
    return slim;
  }

  const report = await proveEscrowMultiLocal({ path: pathName });
  const { slim } = writeLastProveJson(report, {
    source: `prove-bridge:/prove?path=${pathName}`,
    studioPath: LAST_PROVE_PATH,
  });
  return slim;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (url.pathname === '/health' && req.method === 'GET') {
    const exists = fs.existsSync(LAST_PROVE_PATH);
    let writtenAt = null;
    if (exists) {
      try {
        writtenAt = JSON.parse(fs.readFileSync(LAST_PROVE_PATH, 'utf8')).writtenAt || null;
      } catch {
        /* ignore */
      }
    }
    send(res, 200, {
      ok: true,
      service: 'agent-escrow-prove-bridge',
      claim: 'LOCAL ZK bridge — NOT on-chain',
      port: PORT,
      lastProvePath: LAST_PROVE_PATH,
      lastProveExists: exists,
      lastProveWrittenAt: writtenAt,
      proving,
      brand: '@kshot9000',
    });
    return;
  }

  if (url.pathname === '/last-prove' && req.method === 'GET') {
    const data = readLastProve();
    if (!data) {
      send(res, 404, {
        ok: false,
        error: 'No last-prove.json — run npm run prove:escrow-local or POST /prove',
      });
      return;
    }
    send(res, 200, data);
    return;
  }

  if (url.pathname === '/prove' && req.method === 'POST') {
    const pathName = url.searchParams.get('path') || 'initialize';
    if (proving) {
      send(res, 409, { ok: false, error: 'Prove already in progress' });
      return;
    }
    proving = true;
    try {
      const slim = await runProve(pathName);
      send(res, 200, { ok: true, report: slim });
    } catch (e) {
      const code = e?.code === 'PROOF_SERVER_DOWN' ? 503 : 500;
      send(res, code, {
        ok: false,
        error: String(e?.message || e),
        code: e?.code || null,
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
    endpoints: ['GET /health', 'GET /last-prove', 'POST /prove?path=initialize|happy|…'],
  });
});

server.listen(PORT, HOST, () => {
  console.log(`agent-escrow prove-bridge · http://${HOST}:${PORT}`);
  console.log(`  GET  /health`);
  console.log(`  GET  /last-prove  → ${LAST_PROVE_PATH}`);
  console.log(`  POST /prove?path=initialize|happy|cancel|…`);
  console.log(`  claim: LOCAL ZK only — NOT a Preprod deploy`);
  console.log(`  brand: @kshot9000`);
});
