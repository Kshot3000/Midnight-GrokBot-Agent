#!/usr/bin/env node
/**
 * Attempt Preprod faucet drip for a throwaway unshielded address.
 *
 * Public faucet UI requires captcha (X-Captcha-Token). Without a captcha token
 * this will FAIL CLEARLY — we document the response and do NOT claim funding.
 *
 * Amount unit (servicedesk#254): the public /drips route multiplies the
 * requested amount by 5 tNIGHT (TNIGHT_UNIT = 5_000_000n STAR). A body of
 * "amount": "1000" therefore registers 5,000 tNIGHT. Official docs still
 * describe 1,000 tNIGHT per request. This script classifies the unit and
 * does not invent a faucet API or claim the public service is fixed.
 *
 * Usage:
 *   node src/attempt-faucet.mjs [mn_addr_preprod…]
 *   (default: read .secrets/preprod-throwaway-addresses.json)
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PREPROD, BRAND } from './preprod-config.mjs';
import { checkFaucetRequestPath } from './faucet-path-guard.mjs';
import { classifyFaucetAmount, UPSTREAM_FAUCET_AMOUNT } from './faucet-amount-unit.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

function loadDefaultAddress() {
  const p = path.join(repoRoot, '.secrets/preprod-throwaway-addresses.json');
  if (!fs.existsSync(p)) return null;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  return j?.addresses?.unshielded ?? null;
}

async function drip(baseUrl, address, captchaToken, amountStr) {
  const url = `${baseUrl.replace(/\/$/, '')}${PREPROD.faucetDripsPath}`;
  const pathCheck = checkFaucetRequestPath(url);
  if (!pathCheck.ok) {
    return { url, ok: false, skipped: true, failures: pathCheck.failures, upstream: pathCheck.upstream };
  }
  const headers = { 'Content-Type': 'application/json' };
  if (captchaToken) headers['X-Captcha-Token'] = captchaToken;
  const body = {
    recipientAddress: address,
    amount: amountStr,
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
  const amountStr = '1000';
  const amountClass = classifyFaucetAmount(amountStr);
  const bases = [PREPROD.faucet, PREPROD.faucetAlt];
  const attempts = [];

  for (const base of bases) {
    try {
      attempts.push(await drip(base, address, captcha || undefined, amountStr));
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
    requestedAmount: amountStr,
    amountClassification: amountClass,
    attempts,
    manualSteps: [
      `Open ${PREPROD.faucet} in a browser`,
      `Paste ${address}`,
      'Complete captcha → Request tokens',
      `Page sends amount=${amountStr}; servicedesk#254 reports this currently yields ${amountClass.expectedTnight} tNIGHT (confirm the page message)`,
      'Register for tDUST in Lace (Generate tDUST) or SDK',
    ],
    docs: PREPROD.docs.funding,
    amountUnitUpstream: UPSTREAM_FAUCET_AMOUNT,
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
