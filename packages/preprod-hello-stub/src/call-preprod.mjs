#!/usr/bin/env node
/**
 * Preprod hello call — HONEST path.
 *
 * Joins deployed hello contract and calls on-chain `increment` via midnight-js.
 * ONLY claims success after FinalizedCallTxData.public.txId + blockHeight confirm.
 *
 * Brand: donate + @kshot9000. Never logs mnemonic/seed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  findDeployedContract,
  getPublicStates,
} from '@midnight-ntwrk/midnight-js-contracts';
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
const CONTRACT_ADDRESS =
  process.env.MIDNIGHT_HELLO_CONTRACT_ADDRESS ||
  'bfbe9b7b17f23bf85513d3d2b05f7a020c2ffd836b22f50a0097d7530e6d87f9';
const PRIVATE_STATE_ID = 'helloMidnightPrivateState';

function docsDir() {
  return path.resolve(HELLO_OUT, '../../../docs');
}

function readGreetingsSafe(publicDataProvider, contractAddress, ledgerFn) {
  return getPublicStates(publicDataProvider, contractAddress)
    .then((states) => {
      const raw =
        states?.contractState?.data ??
        states?.contractState ??
        null;
      if (!raw || !ledgerFn) return null;
      const led = ledgerFn(raw);
      return led?.greetings != null ? String(led.greetings) : null;
    })
    .catch((e) => {
      warn(`greetings read soft-fail: ${String(e?.message || e)}`);
      return null;
    });
}

async function main() {
  banner('preprod-hello-stub · call increment', {
    claim: 'HONEST — claim call ONLY after public.txId + blockHeight confirm',
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
  kv('contract', CONTRACT_ADDRESS);
  section('Probes');
  kv('proof-server', proof.ok ? 'ok' : `FAIL ${proof.error || proof.body || ''}`);
  kv('indexer', indexer.ok ? `ok height=${indexer.height ?? '?'}` : 'FAIL');
  kv('node', node.ok ? `ok ${node.chain || ''}`.trim() : 'FAIL');
  section('Artifacts');
  kv('helloOut', HELLO_OUT);
  kv('contractModule', HELLO_CONTRACT);

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
      claim: 'wallet credentials present — call NOT completed (ALLOW_SUBMIT!=1)',
      allowSubmit,
      contractAddress: CONTRACT_ADDRESS,
      endpoints: partial.endpoints,
      probes: { proofServer: proof, indexer, node },
      next: [
        'Confirm tNIGHT funded + tDUST registered',
        'Set MIDNIGHT_PREPROD_ALLOW_SUBMIT=1',
        'Re-run stub:call-preprod (long sync possible)',
      ],
      brand: BRAND,
    });
    note('Call blocked pending explicit MIDNIGHT_PREPROD_ALLOW_SUBMIT=1');
    printExitLegend([5, 6, 7]);
    brandLine();
    console.error('\nSTOPPED (honest): credentials + infra OK, but MIDNIGHT_PREPROD_ALLOW_SUBMIT!=1.');
    process.exit(5);
  }

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
      console.error('\nBLOCKED: tDUST still 0 — refuse callTx.increment.');
      await ctx.wallet.stop().catch(() => {});
      process.exit(6);
    }

    section('findDeployedContract + callTx.increment');
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

    const mod = await import(pathToFileURL(HELLO_CONTRACT).href);
    const { Contract, ledger: ledgerFn } = mod;
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

    const greetingsBefore = await readGreetingsSafe(
      providers.publicDataProvider,
      CONTRACT_ADDRESS,
      ledgerFn,
    );
    kv('greetingsBefore', greetingsBefore ?? '(unreadable)');

    note('findDeployedContract…');
    const found = await findDeployedContract(providers, {
      compiledContract: compiled,
      contractAddress: CONTRACT_ADDRESS,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });
    ok(`joined ${CONTRACT_ADDRESS.slice(0, 16)}…`);

    note('Calling callTx.increment (prove + balance + submit)…');
    const finalized = await found.callTx.increment();

    const publicData = finalized?.public ?? {};
    const txId = publicData.txId ?? null;
    const blockHeight = publicData.blockHeight ?? null;
    const status = publicData.status ?? null;
    const blockHash = publicData.blockHash ?? null;
    const txHash = publicData.txHash ?? null;

    if (!txId || blockHeight == null) {
      console.error('\nFAIL: callTx.increment returned without txId/blockHeight — NOT claiming success.');
      printJson({
        claim: 'call attempted — NO txId/blockHeight (not confirmed)',
        publicKeys: Object.keys(publicData),
        status,
        brand: BRAND,
      });
      await ctx.wallet.stop().catch(() => {});
      process.exit(1);
    }

    if (status && status !== 'SucceedEntirely') {
      console.error(`\nFAIL: tx status=${status} — NOT claiming success.`);
      printJson({
        claim: 'call submitted but status not SucceedEntirely',
        txId: String(txId),
        blockHeight,
        status,
        brand: BRAND,
      });
      await ctx.wallet.stop().catch(() => {});
      process.exit(1);
    }

    const greetingsAfter = await readGreetingsSafe(
      providers.publicDataProvider,
      CONTRACT_ADDRESS,
      ledgerFn,
    );

    const record = {
      claim: 'Preprod hello callTx.increment CONFIRMED via public.txId + blockHeight',
      networkId: PREPROD.networkId,
      contractAddress: CONTRACT_ADDRESS,
      circuit: 'increment',
      txId: String(txId),
      txHash: txHash ? String(txHash) : null,
      blockHeight,
      blockHash: blockHash ? String(blockHash) : null,
      status: status ? String(status) : null,
      greetings: {
        before: greetingsBefore,
        after: greetingsAfter,
      },
      unshieldedAddress: ctx.unshieldedAddress,
      calledAt: new Date().toISOString(),
      explorers: PREPROD.explorers,
      brand: BRAND,
    };

    section('CONFIRMED');
    kv('txId', record.txId);
    kv('blockHeight', String(record.blockHeight));
    kv('status', record.status || '?');
    kv('greetings', `${greetingsBefore ?? '?'} → ${greetingsAfter ?? '?'}`);
    ok('call confirmed — recording public fields only');
    printJson(record);
    brandLine();

    const outDir = docsDir();
    fs.mkdirSync(outDir, { recursive: true });
    const jsonPath = path.join(outDir, 'preprod-hello-call.json');
    fs.writeFileSync(jsonPath, `${JSON.stringify(record, null, 2)}\n`);
    console.error(`Wrote ${jsonPath}`);

    // Append call section to PREPROD-HELLO-DEPLOY.md (keep deploy table intact)
    const mdPath = path.join(outDir, 'PREPROD-HELLO-DEPLOY.md');
    let md = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
    const callSection = [
      '',
      '## On-chain call — CONFIRMED',
      '',
      '| Field | Value |',
      '| --- | --- |',
      `| Circuit | \`increment\` |`,
      `| Call tx | \`${record.txId}\` |`,
      `| Block | \`${record.blockHeight}\` |`,
      `| Status | \`${record.status || 'n/a'}\` |`,
      `| Greetings | \`${greetingsBefore ?? '?'} → ${greetingsAfter ?? '?'}\` |`,
      `| Called at (UTC) | \`${record.calledAt}\` |`,
      '',
      'Public call JSON: [`preprod-hello-call.json`](./preprod-hello-call.json). Secrets were never written.',
      '',
    ].join('\n');

    // Replace prior call section if re-run
    if (md.includes('## On-chain call —')) {
      md = md.replace(/## On-chain call —[\s\S]*$/m, callSection.trimStart());
    } else {
      md = md.trimEnd() + '\n' + callSection;
    }
    fs.writeFileSync(mdPath, md.endsWith('\n') ? md : md + '\n');
    console.error(`Updated ${mdPath}`);

    await ctx.wallet.stop().catch(() => {});
    process.exit(0);
  } catch (e) {
    console.error('\nCALL PATH ERROR (honest — NOT claiming success):');
    console.error(String(e?.stack || e));
    let cause = e?.cause;
    let depth = 0;
    while (cause && depth < 6) {
      console.error(`cause[${depth}]:`, String(cause?.stack || cause));
      cause = cause?.cause;
      depth += 1;
    }
    printJson({
      claim: 'call NOT confirmed — error before/during submit',
      error: String(e?.message || e),
      cause: e?.cause ? String(e.cause?.message || e.cause) : null,
      contractAddress: CONTRACT_ADDRESS,
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
    console.error('call-preprod failed:', e);
    process.exit(1);
  });
}

export { main };
