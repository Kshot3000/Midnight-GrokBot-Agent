/**
 * Build + sync a Preprod WalletFacade from MIDNIGHT_WALLET_SEED / MNEMONIC.
 * Follows https://docs.midnight.network/guides/acquire-tokens
 *
 * Secrets never logged. Sync can take a long time against public indexer.
 */
import { Buffer } from 'node:buffer';
import { mnemonicToSeedSync } from '@scure/bip39';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import {
  HDWallet,
  Roles,
  createKeystore,
  WalletFacade,
  ShieldedWallet,
  DustWallet,
  UnshieldedWallet,
  PublicKey,
  NoOpTransactionHistoryStorage,
  DustAddress,
  MidnightBech32m,
} from '@midnight-ntwrk/wallet-sdk';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { ttlOneHour } from '@midnight-ntwrk/midnight-js-utils';

import { PREPROD } from './preprod-config.mjs';
import { readWalletCredentials } from './require-wallet-env.mjs';

const STAR_PER_NIGHT = 1_000_000n;
const SPECK_PER_DUST = 1_000_000_000_000_000n;

export function formatNight(raw) {
  const n = BigInt(raw);
  return `${n / STAR_PER_NIGHT}.${(n % STAR_PER_NIGHT).toString().padStart(6, '0')}`;
}

export function formatDust(raw) {
  const n = BigInt(raw);
  return `${n / SPECK_PER_DUST}.${(n % SPECK_PER_DUST).toString().padStart(15, '0')}`;
}

export function resolveSeedHex(creds = readWalletCredentials()) {
  if (!creds.ok) throw new Error(creds.message);
  if (creds.kind === 'seed') return creds.seed;
  // BIP-39 mnemonic → 64-byte seed hex (Lace-compatible)
  return Buffer.from(mnemonicToSeedSync(creds.mnemonic)).toString('hex');
}

export function deriveRoleKeys(seedHex) {
  const hd = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
  if (hd.type !== 'seedOk') throw new Error('Invalid seed for HDWallet');
  const result = hd.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hd.hdWallet.clear();
  return result.keys;
}

/**
 * @returns {Promise<{
 *   wallet: import('@midnight-ntwrk/wallet-sdk').WalletFacade,
 *   shieldedSecretKeys: import('@midnight-ntwrk/midnight-js-protocol/ledger').ZswapSecretKeys,
 *   dustSecretKey: import('@midnight-ntwrk/midnight-js-protocol/ledger').DustSecretKey,
 *   unshieldedKeystore: ReturnType<typeof createKeystore>,
 *   unshieldedAddress: string,
 * }>}
 */
export async function buildPreprodWalletFromEnv() {
  if (!globalThis.WebSocket) {
    globalThis.WebSocket = WebSocket;
  }
  setNetworkId(PREPROD.networkId);

  const seedHex = resolveSeedHex();
  const keys = deriveRoleKeys(seedHex);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());
  const unshieldedAddress = String(unshieldedKeystore.getBech32Address());

  const indexerHttpUrl = process.env.MIDNIGHT_INDEXER_URL || PREPROD.indexer;
  const indexerWsUrl = process.env.MIDNIGHT_INDEXER_WS_URL || PREPROD.indexerWS;
  const nodeUrl = process.env.MIDNIGHT_NODE_URL || PREPROD.node;
  const proofServer = process.env.MIDNIGHT_PROOF_SERVER_URL || PREPROD.proofServer;

  // batchUpdates.size=5000: Preprod cold-sync OOM workaround (servicedesk#145 / wallet#425)
  const batchUpdates = { size: 5000, timeout: 1, spacing: 4 };
  const shieldedConfig = {
    networkId: getNetworkId(),
    indexerClientConnection: { indexerHttpUrl, indexerWsUrl },
    provingServerUrl: new URL(proofServer),
    relayURL: new URL(nodeUrl.replace(/^http/, 'ws')),
    batchUpdates,
  };
  const unshieldedConfig = {
    networkId: getNetworkId(),
    indexerClientConnection: { indexerHttpUrl, indexerWsUrl },
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
  };
  const dustConfig = {
    ...shieldedConfig,
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n, // 0.3 DUST buffer
      feeBlocksMargin: 5,
    },
    batchUpdates,
  };

  const wallet = await WalletFacade.init({
    configuration: { ...shieldedConfig, ...unshieldedConfig, ...dustConfig },
    shielded: (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg) =>
      UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (cfg) =>
      DustWallet(cfg).startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust,
      ),
  });
  await wallet.start(shieldedSecretKeys, dustSecretKey);

  return {
    wallet,
    shieldedSecretKeys,
    dustSecretKey,
    unshieldedKeystore,
    unshieldedAddress,
  };
}

/** Log sync progress until connected / funded / synced. */
export async function waitUntilConnected(wallet, { timeoutMs = 120_000 } = {}) {
  const connected = await Promise.race([
    Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.filter(
          (s) =>
            s.shielded.state.progress.isConnected &&
            s.unshielded.state.progress.isConnected &&
            s.dust.state.progress.isConnected,
        ),
      ),
    ),
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`wallet connect timeout after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
  return connected;
}

export function nightBalanceFromState(state, unshieldedKeystore) {
  const rawType = ledger.unshieldedToken().raw;
  return state.unshielded.balances[rawType] ?? 0n;
}

export function dustBalanceFromState(state) {
  return state.dust.balance(new Date());
}

/**
 * Wait for tNIGHT > 0 (can arrive before full sync).
 */
export async function waitForNightBalance(wallet, unshieldedKeystore, { timeoutMs = 600_000 } = {}) {
  const start = Date.now();
  const sub = wallet.state().subscribe((s) => {
    const night = nightBalanceFromState(s, unshieldedKeystore);
    const dust = dustBalanceFromState(s);
    const age = ((Date.now() - start) / 1000).toFixed(0);
    console.error(
      `[wallet ${age}s] synced=${s.isSynced} tNIGHT=${formatNight(night)} tDUST=${formatDust(dust)}`,
    );
  });
  try {
    const bal = await Promise.race([
      Rx.firstValueFrom(
        wallet.state().pipe(
          Rx.throttleTime(10_000),
          Rx.map((state) => nightBalanceFromState(state, unshieldedKeystore)),
          Rx.filter((b) => b > 0n),
        ),
      ),
      new Promise((_, rej) =>
        setTimeout(
          () => rej(new Error(`tNIGHT balance still 0 after ${timeoutMs}ms — faucet credit not visible yet`)),
          timeoutMs,
        ),
      ),
    ]);
    return bal;
  } finally {
    sub.unsubscribe();
  }
}

/**
 * Full indexer sync — can be long on Preprod.
 */
export async function waitForSynced(wallet, {
  timeoutMs = 2_700_000,
  logEveryMs = 30_000,
  /** If shielded appliedIndex stalls this long with highestRelevantIndex=0, treat as OK for faucet-only wallets. */
  shieldedStallBypassMs = 120_000,
} = {}) {
  const start = Date.now();
  let lastLog = 0;
  let lastShieldedApplied = null;
  let shieldedStallSince = null;

  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      sub.unsubscribe();
      reject(new Error(`waitForSynced timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    const sub = wallet.state().subscribe((s) => {
      const now = Date.now();
      const sp = s.shielded?.state?.progress;
      const up = s.unshielded?.state?.progress;
      const dp = s.dust?.state?.progress;

      const unshieldedDone =
        up &&
        String(up.appliedId) === String(up.highestTransactionId) &&
        up.isConnected;
      const dustDone =
        dp &&
        BigInt(dp.appliedIndex ?? 0) >= BigInt(dp.highestRelevantWalletIndex ?? 0) &&
        dp.isConnected;
      const shieldedDone =
        sp &&
        BigInt(sp.appliedIndex ?? 0) >= BigInt(sp.highestRelevantWalletIndex ?? 0) &&
        sp.isConnected;

      // Track shielded stall (common Preprod trap near head for empty shielded wallets)
      const applied = sp ? String(sp.appliedIndex) : null;
      const relevantIdx = sp ? BigInt(sp.highestRelevantIndex ?? 0) : 0n;
      if (applied !== lastShieldedApplied) {
        lastShieldedApplied = applied;
        shieldedStallSince = now;
      } else if (shieldedStallSince == null) {
        shieldedStallSince = now;
      }
      const appliedBi = sp ? BigInt(sp.appliedIndex ?? 0) : 0n;
      const nearHead = appliedBi >= 1_400_000n;
      const stallMs = nearHead ? Math.min(shieldedStallBypassMs, 60_000) : shieldedStallBypassMs;
      const shieldedStalled =
        sp &&
        relevantIdx === 0n &&
        shieldedStallSince != null &&
        now - shieldedStallSince >= stallMs &&
        appliedBi > 0n;

      if (now - lastLog >= logEveryMs) {
        lastLog = now;
        const age = ((now - start) / 1000).toFixed(0);
        console.error(
          `[sync ${age}s] isSynced=${s.isSynced} unshieldedDone=${!!unshieldedDone} dustDone=${!!dustDone} shieldedDone=${!!shieldedDone} shieldedStallBypass=${!!shieldedStalled} shielded=${JSON.stringify(summarizeProgress(sp))} unshielded=${JSON.stringify(summarizeProgress(up))} dust=${JSON.stringify(summarizeProgress(dp))}`,
        );
      }

      // Require dust sync complete before registration (dust Sync fiber crash aborts register).
      // Shielded may stall near head on faucet-only wallets — allow stall bypass.
      if (s.isSynced || (unshieldedDone && dustDone && (shieldedDone || shieldedStalled))) {
        clearTimeout(timer);
        sub.unsubscribe();
        if (!s.isSynced && shieldedStalled) {
          console.error(
            '[sync] BYPASS: shielded stall with highestRelevantIndex=0 — proceeding (faucet-only / empty shielded wallet)',
          );
        }
        resolve(s);
      }
    });
  });
}

function summarizeProgress(p) {
  if (!p) return null;
  const out = {};
  for (const k of Object.keys(p)) {
    const v = p[k];
    if (typeof v === 'bigint') out[k] = v.toString();
    else if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') out[k] = v;
  }
  return out;
}

/**
 * Register unregistered NIGHT UTXOs for DUST generation, then wait until tDUST > 0.
 */
export async function ensureDustRegistered(wallet, unshieldedKeystore, {
  dustWaitTimeoutMs = 600_000,
} = {}) {
  // Prefer current state (caller already waited); fall back to SDK wait if needed.
  let state;
  try {
    state = await Promise.race([
      Rx.firstValueFrom(wallet.state()),
      new Promise((_, rej) => setTimeout(() => rej(new Error('state timeout')), 15_000)),
    ]);
  } catch {
    state = await wallet.waitForSyncedState();
  }
  const unregistered = state.unshielded.availableCoins.filter(
    (coin) => coin.meta?.registeredForDustGeneration !== true,
  );

  let registrationTxId = null;
  if (unregistered.length === 0) {
    console.error('[dust] All NIGHT UTXOs already registered for DUST generation.');
  } else {
    console.error(`[dust] Registering ${unregistered.length} NIGHT UTXO(s) one-at-a-time…`);
    const target = String(DustAddress.encodePublicKey(getNetworkId(), state.dust.publicKey));
    const dustReceiver = MidnightBech32m.parse(target).decode(DustAddress, getNetworkId());
    // Oldest first — more retroactive DUST for fee (wallet#415).
    for (let i = 0; i < unregistered.length; i++) {
      const coin = unregistered[i];
      console.error(`[dust] register ${i + 1}/${unregistered.length}…`);
      try {
        const recipe = await wallet.registerNightUtxosForDustGeneration(
          [coin],
          unshieldedKeystore.getPublicKey(),
          (payload) => unshieldedKeystore.signData(payload),
          dustReceiver,
        );
        const finalized = await wallet.finalizeRecipe(recipe);
        registrationTxId = await wallet.submitTransaction(finalized);
        console.error(`[dust] Registration submitted txId=${registrationTxId}`);
        // Refresh available list after first success; subsequent may already be registered via self-spend.
        break;
      } catch (e) {
        const cause = e?.cause ?? e?.error ?? e?.message ?? e;
        console.error(`[dust] register attempt ${i + 1} failed:`, String(e));
        console.error('[dust] cause:', typeof cause === 'object' ? JSON.stringify(cause, Object.getOwnPropertyNames(cause), 2) : String(cause));
        if (i === unregistered.length - 1) throw e;
      }
    }
  }

  const existing = dustBalanceFromState(await Rx.firstValueFrom(wallet.state()));
  if (existing > 0n) {
    console.error(`[dust] tDUST already available: ${formatDust(existing)}`);
    return { registrationTxId, dustBalance: existing };
  }

  console.error('[dust] Waiting for tDUST accrual (may take 1–2+ minutes)…');
  await Promise.race([
    Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(5_000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => dustBalanceFromState(s) > 0n),
      ),
    ),
    new Promise((_, rej) =>
      setTimeout(
        () => rej(new Error(`tDUST still 0 after ${dustWaitTimeoutMs}ms post-registration`)),
        dustWaitTimeoutMs,
      ),
    ),
  ]);
  const dustBalance = dustBalanceFromState(await Rx.firstValueFrom(wallet.state()));
  console.error(`[dust] tDUST ready: ${formatDust(dustBalance)}`);
  return { registrationTxId, dustBalance };
}

/**
 * WalletProvider + MidnightProvider backed by synced WalletFacade.
 */
export function makeWalletMidnightProvider(wallet, shieldedSecretKeys, dustSecretKey) {
  return {
    getCoinPublicKey: () => shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => shieldedSecretKeys.encryptionPublicKey,
    balanceTx: async (tx, ttl = ttlOneHour()) => {
      const recipe = await wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys, dustSecretKey },
        { ttl },
      );
      return await wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx) => wallet.submitTransaction(tx),
  };
}
