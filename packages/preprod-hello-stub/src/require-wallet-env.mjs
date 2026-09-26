#!/usr/bin/env node
/**
 * Clear-fail gate: Preprod deploy / provider wallet slots need a funded seed.
 * Exits 2 with actionable message when MIDNIGHT_WALLET_SEED / MNEMONIC missing.
 * Does NOT deploy. Does NOT invent secrets.
 */
import { pathToFileURL } from 'node:url';
import { loadPreprodEnv } from './load-env.mjs';
import { PREPROD, BRAND } from './preprod-config.mjs';
import { banner, brandLine, printExitLegend, ok, printJson } from './cli-format.mjs';

loadPreprodEnv();

const SEED_HEX_RE = /^(?:[0-9a-fA-F]{2}){16,64}$/;

export function readWalletCredentials(env = process.env) {
  const rawSeed = env.MIDNIGHT_WALLET_SEED?.trim();
  const rawMnemonic = env.MIDNIGHT_WALLET_MNEMONIC?.trim();

  if (rawSeed && rawMnemonic) {
    return {
      ok: false,
      code: 'BOTH_SET',
      message:
        'Both MIDNIGHT_WALLET_SEED and MIDNIGHT_WALLET_MNEMONIC are set — unset one; they would select different wallets.',
    };
  }

  if (rawSeed) {
    const hex = rawSeed.startsWith('0x') || rawSeed.startsWith('0X') ? rawSeed.slice(2) : rawSeed;
    if (!SEED_HEX_RE.test(hex)) {
      return {
        ok: false,
        code: 'BAD_SEED',
        message:
          'MIDNIGHT_WALLET_SEED must be 32–128 hex characters (16–64 whole bytes). Lace-compatible BIP-39 seed is 128 hex chars.',
      };
    }
    return { ok: true, kind: 'seed', seed: hex, mnemonic: null };
  }

  if (rawMnemonic) {
    const words = rawMnemonic.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length !== 12 && words.length !== 24) {
      return {
        ok: false,
        code: 'BAD_MNEMONIC',
        message: `MIDNIGHT_WALLET_MNEMONIC must be 12 or 24 BIP-39 words (got ${words.length}).`,
      };
    }
    return { ok: true, kind: 'mnemonic', seed: null, mnemonic: words.join(' ') };
  }

  return {
    ok: false,
    code: 'MISSING',
    message: 'No wallet credentials. Set MIDNIGHT_WALLET_SEED or MIDNIGHT_WALLET_MNEMONIC in .env.preprod (gitignored).',
  };
}

export function requireWalletOrExit() {
  const creds = readWalletCredentials();
  if (creds.ok) return creds;

  console.error('════════════════════════════════════════════════════════════════');
  console.error('  ERROR: Preprod wallet keys required — refusing to pretend deploy.');
  console.error('════════════════════════════════════════════════════════════════');
  console.error(`  code: ${creds.code}`);
  console.error(`  ${creds.message}`);
  console.error('');
  console.error('Fix:');
  console.error('  1. cp .env.preprod.example .env.preprod');
  console.error('  2. Generate a throwaway wallet: npm run stub:wallet-gen');
  console.error('     (writes secrets under .secrets/ — NEVER commit)');
  console.error('  3. Fund unshielded mn_addr_preprod… via faucet (captcha in browser):');
  console.error(`     ${PREPROD.faucet}`);
  console.error(`     alt: ${PREPROD.faucetAlt}`);
  console.error('  4. Register tNIGHT for tDUST (Lace "Generate tDUST" or wallet SDK).');
  console.error('  5. Re-run deploy only after tDUST > 0.');
  console.error('');
  console.error(`Docs: ${PREPROD.docs.funding}`);
  console.error(`Brand donate: ${BRAND.donate}`);
  console.error(`X: ${BRAND.x}`);
  process.exit(2);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  banner('preprod-hello-stub · require wallet', {
    claim: 'credentials check only — NOT a deploy',
  });
  const c = requireWalletOrExit();
  ok(`credentials present (${c.kind})`);
  printJson({ ok: true, kind: c.kind, claim: 'credentials present — NOT a deploy' });
  printExitLegend([2]);
  brandLine();
}
