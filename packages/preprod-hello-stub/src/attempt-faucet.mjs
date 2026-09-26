#!/usr/bin/env node
/**
 * Attempt Preprod faucet drip for a throwaway unshielded address.
 *
 * Public faucet UI requires captcha (X-Captcha-Token). Without a captcha token
 * this will FAIL CLEARLY — we document the response and do NOT claim funding.
 *
 * Usage:
 *   node src/attempt-faucet.mjs [mn_addr_preprod…]
 *   (default: read .secrets/preprod-throwaway-addresses.json)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PREPROD, BRAND } from './preprod-config.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

function loadDefaultAddress() {
  const p = path.join(repoRoot, '.secrets/preprod-throwaway-addresses.json');
  if (!fs.existsSync(p)) return null;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  return j?.addresses?.unshielded ?? null;
}

async function drip(baseUrl, address, captchaToken) {
  const url = `${baseUrl.replace(/\/$/, '')}${PREPROD.faucetDripsPath}`;
  const headers = { 'Content-Type': 'application/json' };
  if (captchaToken) headers['X-Captcha-Token'] = captchaToken;
  const body = {
    recipientAddress: address,
    // Faucet UI encodes amount as bigint-from-string; omit or send string "1000"
    amount: '1000',
  };
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* plain */
  }
  return { url, status: res.status, ok: res.ok, text: text.slice(0, 500), json };
}

async function main() {
  const address = process.argv[2] || loadDefaultAddress();
  if (!address || !String(address).startsWith(PREPROD.addressPrefixes.unshielded)) {
    console.error('ERROR: need mn_addr_preprod… address (generate with stub:wallet-gen first)');
    process.exit(2);
  }

  const captcha = process.env.MIDNIGHT_FAUCET_CAPTCHA_TOKEN?.trim() || '';
  const bases = [PREPROD.faucet, PREPROD.faucetAlt];
  const attempts = [];

  for (const base of bases) {
    try {
      attempts.push(await drip(base, address, captcha || undefined));
    } catch (e) {
      attempts.push({ url: base, error: String(e?.message || e) });
    }
  }

  const anyOk = attempts.some((a) => a.ok);
  const report = {
    claim: anyOk
      ? 'faucet HTTP accepted request — WAIT for on-chain credit; NOT a deploy'
      : 'faucet attempt FAILED (expected without captcha) — NOT funded, NOT deployed',
    address,
    captchaProvided: Boolean(captcha),
    attempts,
    manualSteps: [
      `Open ${PREPROD.faucet} in a browser`,
      `Paste ${address}`,
      'Complete captcha → Request tokens (~1000 tNIGHT)',
      'Register for tDUST in Lace (Generate tDUST) or SDK',
    ],
    docs: PREPROD.docs.funding,
    brand: BRAND,
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(anyOk ? 0 : 7);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
