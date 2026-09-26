#!/usr/bin/env node
/**
 * Generate a Lace-compatible Preprod throwaway wallet (24-word BIP-39).
 * Writes secrets under .secrets/ (gitignored) and optional box path.
 * NEVER prints mnemonic to git-tracked files. NEVER commits private keys.
 *
 * Public addresses are safe to log / document.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Buffer } from 'node:buffer';
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { HDWallet, Roles, createKeystore } from '@midnight-ntwrk/wallet-sdk';
import { PREPROD, BRAND } from './preprod-config.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const secretsDir = path.join(repoRoot, '.secrets');
const boxSecretsDir = '/workspace/secrets/midnight-preprod';

function deriveAddresses(seedHex) {
  setNetworkId(PREPROD.networkId);
  const hd = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
  if (hd.type !== 'seedOk') throw new Error('Invalid seed for HDWallet');
  const result = hd.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  const keys = result.keys;
  hd.hdWallet.clear();
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], PREPROD.networkId);
  return {
    unshielded: String(unshieldedKeystore.getBech32Address()),
  };
}

function writeSecret(dir, basename, contents, mode = 0o600) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const p = path.join(dir, basename);
  fs.writeFileSync(p, contents, { mode });
  return p;
}

async function main() {
  const mnemonic = generateMnemonic(wordlist, 256);
  const seed = Buffer.from(mnemonicToSeedSync(mnemonic)).toString('hex');
  const { unshielded } = deriveAddresses(seed);
  const createdAt = new Date().toISOString();

  const secretPayload = {
    networkId: PREPROD.networkId,
    createdAt,
    mnemonic,
    seed,
    addresses: { unshielded },
    warning: 'THROWAY LAB WALLET — never commit; never reuse for mainnet value',
  };

  const publicPayload = {
    networkId: PREPROD.networkId,
    createdAt,
    addresses: { unshielded },
    faucet: PREPROD.faucet,
    faucetAlt: PREPROD.faucetAlt,
    fundingSteps: [
      `Paste unshielded address into faucet (captcha): ${PREPROD.faucet}`,
      'Wait for ~1000 tNIGHT',
      'In Lace: Generate tDUST / register NIGHT for DUST generation',
      'Copy seed/mnemonic into .env.preprod (gitignored) — do not commit',
    ],
    brand: BRAND,
    claim: 'addresses only — wallet NOT funded, NOT deployed',
  };

  const secretPaths = [
    writeSecret(secretsDir, 'preprod-throwaway-wallet.json', `${JSON.stringify(secretPayload, null, 2)}\n`),
    writeSecret(boxSecretsDir, 'preprod-throwaway-wallet.json', `${JSON.stringify(secretPayload, null, 2)}\n`),
  ];

  const publicPath = path.join(secretsDir, 'preprod-throwaway-addresses.json');
  fs.mkdirSync(secretsDir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(publicPath, `${JSON.stringify(publicPayload, null, 2)}\n`, { mode: 0o644 });

  // Also write a ready-to-copy env fragment (secrets dir only)
  const envFrag = [
    '# Generated throwaway — DO NOT COMMIT',
    `# createdAt=${createdAt}`,
    `MIDNIGHT_WALLET_MNEMONIC="${mnemonic}"`,
    `# MIDNIGHT_WALLET_SEED=${seed}`,
    '',
  ].join('\n');
  writeSecret(secretsDir, 'preprod-throwaway.env', envFrag);
  writeSecret(boxSecretsDir, 'preprod-throwaway.env', envFrag);

  console.log(JSON.stringify({ ...publicPayload, secretPaths, publicPath }, null, 2));
  console.error('\nSecret mnemonic/seed written under .secrets/ and /workspace/secrets/midnight-preprod/');
  console.error('Public address (safe to share / faucet):');
  console.error(`  ${unshielded}`);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
