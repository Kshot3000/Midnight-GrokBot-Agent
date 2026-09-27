#!/usr/bin/env node
/**
 * Preprod hello deploy — HONEST path.
 *
 * Without wallet keys → exit 2.
 * Without MIDNIGHT_PREPROD_ALLOW_SUBMIT=1 → exit 5 (infra+creds OK).
 * With allow: sync WalletFacade, register tDUST if needed, deployContract.
 * ONLY prints success after deployTxData.public.contractAddress is returned.
 *
 * Brand: donate + @kshot9000. Never logs mnemonic/seed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';

import { loadPreprodEnv } from './load-env.mjs';
import { requireWalletOrExit } from './require-wallet-env.mjs';
import {
  assembleProvidersWithoutWallet,
  probeProofServer,
  probeIndexer,
  probeNode,
  applyPreprodNetwork,
} from './providers.mjs';
import { PREPROD, BRAND } from './preprod-config.mjs';
import { HELLO_OUT, HELLO_CONTRACT } from './paths.mjs';
import {
  banner,
  section,
  kv,
  note,
  warn,
  brandLine,
  printJson,
  printExitLegend,
  ok,
} from './cli-format.mjs';
import {
  buildPreprodWalletFromEnv,
  waitUntilConnected,
  waitForNightBalance,
  waitForSynced,
  ensureDustRegistered,
  makeWalletMidnightProvider,
  nightBalanceFromState,
  dustBalanceFromState,
  formatNight,
  formatDust,
} from './wallet-facade.mjs';

loadPreprodEnv();

const allowSubmit = process.env.MIDNIGHT_PREPROD_ALLOW_SUBMIT === '1';
const EXPECTED_ADDR =
  process.env.MIDNIGHT_EXPECTED_UNSHIELDED ||
  'mn_addr_preprod1ex8d8jusga4wpex65nc7uerarjhhfh0yl0z725h30vfcwnr3tztsujaew3';

async function main() {
  banner('preprod-hello-stub · deploy gate', {
    claim: 'HONEST gate — claim deploy ONLY after deployTxData.public.contractAddress',
  });

  requireWalletOrExit();

  applyPreprodNetwork();
  const partial = assembleProvidersWithoutWallet();
  const [proof, indexer, node] = await Promise.all([
    probeProofServer(),
    probeIndexer(),
    probeNode(),
  ]);

  section('Credentials');
  kv('allowSubmit', allowSubmit ? '1' : '0 (default honest stop)');
  section('Probes');
  kv('proof-server', proof.ok ? 'ok' : `FAIL ${proof.error || proof.body || ''}`);
  kv('indexer', indexer.ok ? `ok height=${indexer.height ?? '?'}` : 'FAIL');
  kv('node', node.ok ? `ok ${node.chain || ''}`.trim() : 'FAIL');
  section('Artifacts');
  kv('helloOut', HELLO_OUT);
  kv('contract', HELLO_CONTRACT);

  if (!proof.ok) {
    warn('BLOCKED: proof-server unhealthy — refuse submit.');
    printExitLegend([3]);
    brandLine();
    console.error('\nBLOCKED: proof-server unhealthy — refuse submit.');
    process.exit(3);
  }

  if (!indexer.ok || !node.ok) {
    console.error('\nBLOCKED: Preprod indexer/node probe failed.');
    process.exit(4);
  }

  if (!allowSubmit) {
    printJson({
      claim: 'wallet credentials present — deploy NOT completed (ALLOW_SUBMIT!=1)',
      allowSubmit,
      endpoints: partial.endpoints,
      probes: { proofServer: proof, indexer, node },
      artifacts: { helloOut: HELLO_OUT, contract: HELLO_CONTRACT },
      next: [
        'Confirm tNIGHT funded + tDUST registered',
        'Set MIDNIGHT_PREPROD_ALLOW_SUBMIT=1',
        'Re-run stub:deploy-preprod (long sync possible)',
      ],
      brand: BRAND,
    });
    note('Deploy blocked pending explicit MIDNIGHT_PREPROD_ALLOW_SUBMIT=1');
    printExitLegend([5, 6, 7]);
    brandLine();
    console.error('\nSTOPPED (honest): credentials + infra OK, but MIDNIGHT_PREPROD_ALLOW_SUBMIT!=1.');
    process.exit(5);
  }

  // ── Real submit path ──────────────────────────────────────────────
  section('WalletFacade');
  note('Building wallet from .env.preprod (seed never printed)…');
  const ctx = await buildPreprodWalletFromEnv();
  kv('unshielded', ctx.unshieldedAddress);

  if (EXPECTED_ADDR && ctx.unshieldedAddress !== EXPECTED_ADDR) {
    console.error(
      `\nBLOCKED: derived address ${ctx.unshieldedAddress} != expected ${EXPECTED_ADDR}`,
    );
    console.error('Wrong seed/mnemonic in .env.preprod — refusing submit.');
    await ctx.wallet.stop().catch(() => {});
    process.exit(7);
  }

  try {
    note('Waiting for indexer connection…');
    await waitUntilConnected(ctx.wallet, { timeoutMs: 180_000 });
    ok('all three sub-wallets connected');

    note('Waiting for tNIGHT balance (>0)…');
    const nightBal = await waitForNightBalance(ctx.wallet, ctx.unshieldedKeystore, {
      timeoutMs: 900_000,
    });
    kv('tNIGHT', formatNight(nightBal));
    ok('tNIGHT visible');

    note('Waiting for full wallet sync (can take a long time on Preprod)…');
    const synced = await waitForSynced(ctx.wallet, { timeoutMs: 2_700_000 });
    kv('synced', String(synced.isSynced));
    kv('tNIGHT@sync', formatNight(nightBalanceFromState(synced, ctx.unshieldedKeystore)));
    kv('tDUST@sync', formatDust(dustBalanceFromState(synced)));
    ok('wallet synced');

    section('tDUST registration');
    const dustInfo = await ensureDustRegistered(ctx.wallet, ctx.unshieldedKeystore, {
      dustWaitTimeoutMs: 900_000,
    });
    kv('registrationTxId', dustInfo.registrationTxId || '(already registered)');
    kv('tDUST', formatDust(dustInfo.dustBalance));

    if (dustInfo.dustBalance <= 0n) {
      console.error('\nBLOCKED: tDUST still 0 — refuse deployContract.');
      await ctx.wallet.stop().catch(() => {});
      process.exit(6);
    }

    section('deployContract');
    const walletProvider = makeWalletMidnightProvider(
      ctx.wallet,
      ctx.shieldedSecretKeys,
      ctx.dustSecretKey,
    );
    const accountId = String(ctx.unshieldedKeystore.getBech32Address());
    const password =
      process.env.PRIVATE_STATE_PASSWORD || 'Preprod-Lab-HelloDeploy-1';
    const privateStateProvider = levelPrivateStateProvider({
      privateStateStoreName: 'hello-midnight-private-state',
      signingKeyStoreName: 'hello-midnight-signing-keys',
      privateStoragePasswordProvider: () => password,
      accountId,
    });

    const { Contract } = await import(pathToFileURL(HELLO_CONTRACT).href);
    const compiled = CompiledContract.withCompiledFileAssets(
      CompiledContract.withVacantWitnesses(CompiledContract.make('hello-midnight', Contract)),
      HELLO_OUT,
    );

    const providers = {
      privateStateProvider,
      publicDataProvider: partial.providers.publicDataProvider,
      zkConfigProvider: partial.providers.zkConfigProvider,
      proofProvider: partial.providers.proofProvider,
      walletProvider,
      midnightProvider: walletProvider,
    };

    note('Calling deployContract (prove + balance + submit)…');
    const deployed = await deployContract(providers, {
      compiledContract: compiled,
      privateStateId: 'helloMidnightPrivateState',
      initialPrivateState: {},
    });

    const publicData = deployed?.deployTxData?.public ?? {};
    const contractAddress = publicData.contractAddress;
    const txId = publicData.txId ?? publicData.transactionId ?? null;
    const blockHeight = publicData.blockHeight ?? null;

    if (!contractAddress) {
      console.error('\nFAIL: deployContract returned without contractAddress — NOT claiming success.');
      printJson({
        claim: 'deploy attempted — NO contractAddress (not confirmed)',
        deployTxDataKeys: Object.keys(deployed?.deployTxData || {}),
        publicKeys: Object.keys(publicData),
        brand: BRAND,
      });
      await ctx.wallet.stop().catch(() => {});
      process.exit(1);
    }

    const record = {
      claim: 'Preprod hello deploy CONFIRMED via deployTxData.public.contractAddress',
      networkId: PREPROD.networkId,
      contractAddress: String(contractAddress),
      txId: txId ? String(txId) : null,
      blockHeight,
      unshieldedAddress: ctx.unshieldedAddress,
      dustRegistrationTxId: dustInfo.registrationTxId,
      deployedAt: new Date().toISOString(),
      explorers: PREPROD.explorers,
      brand: BRAND,
    };

    section('CONFIRMED');
    kv('contractAddress', record.contractAddress);
    kv('txId', record.txId || '(see deployTxData)');
    kv('blockHeight', record.blockHeight ?? '?');
    ok('deploy confirmed — recording public addresses only');
    printJson(record);
    brandLine();

    // Write public-only deployment record under docs/ (no secrets)
    const docsDir = path.resolve(HELLO_OUT, '../../../docs');
    const outPath = path.join(docsDir, 'PREPROD-HELLO-DEPLOY.md');
    const jsonPath = path.join(docsDir, 'preprod-hello-deploy.json');
    const md = [
      '# Preprod hello deploy — CONFIRMED',
      '',
      `**Brand:** donate \`${BRAND.donate}\` · [@kshot9000](${BRAND.xUrl})`,
      '',
      '| Field | Value |',
      '| --- | --- |',
      `| Network | \`${record.networkId}\` |`,
      `| Contract | \`${record.contractAddress}\` |`,
      `| Tx | \`${record.txId || 'n/a'}\` |`,
      `| Block | \`${record.blockHeight ?? 'n/a'}\` |`,
      `| Deployer (unshielded) | \`${record.unshieldedAddress}\` |`,
      `| Dust registration tx | \`${record.dustRegistrationTxId || 'already registered'}\` |`,
      `| Deployed at (UTC) | \`${record.deployedAt}\` |`,
      '',
      'Explorers: ' + PREPROD.explorers.map((u) => `[${u}](${u})`).join(' · '),
      '',
      'Secrets were never written to this file.',
      '',
    ].join('\n');
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(outPath, md);
    fs.writeFileSync(jsonPath, `${JSON.stringify(record, null, 2)}\n`);
    console.error(`Wrote ${outPath}`);
    console.error(`Wrote ${jsonPath}`);

    await ctx.wallet.stop().catch(() => {});
    process.exit(0);
  } catch (e) {
    console.error('\nDEPLOY PATH ERROR (honest — NOT claiming success):');
    console.error(String(e?.stack || e));
    printJson({
      claim: 'deploy NOT confirmed — error before/during submit',
      error: String(e?.message || e),
      brand: BRAND,
    });
    brandLine();
    await ctx.wallet.stop().catch(() => {});
    process.exit(1);
  }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((e) => {
    console.error('deploy-preprod failed:', e);
    process.exit(1);
  });
}

export { main };
