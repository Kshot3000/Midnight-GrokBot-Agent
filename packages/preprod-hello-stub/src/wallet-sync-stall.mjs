/**
 * Classify Preprod wallet-sync stall reports. Does not call the wallet SDK,
 * does not invent a sync-duration number, and does not fix the public
 * indexer or node.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1381
 * Related: https://github.com/midnightntwrk/servicedesk/issues/251
 * Official: https://docs.midnight.network/sdks/official/wallet-developer-guide
 * Official: https://docs.midnight.network/guides/acquire-tokens
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const builderCredit = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const WALLET_SYNC_DOCS = {
  upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1381',
  related: 'https://github.com/midnightntwrk/servicedesk/issues/251',
  walletGuide: 'https://docs.midnight.network/sdks/official/wallet-developer-guide',
  acquireTokens: 'https://docs.midnight.network/guides/acquire-tokens',
  proofServerSample: 'http://localhost:6300',
  proofServerImage: 'midnightntwrk/proof-server:8.1.0',
};

function textOf(input) {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  const parts = [input.message, input.name, input.stack];
  if (input.cause) parts.push(textOf(input.cause));
  return parts.filter(Boolean).join('\n');
}

function result(kind, hint) {
  return {
    kind,
    hint,
    upstream: WALLET_SYNC_DOCS.upstream,
    related: WALLET_SYNC_DOCS.related,
    docs: WALLET_SYNC_DOCS.walletGuide,
    credit: builderCredit,
  };
}

/**
 * Map a log or chat symptom onto the published wallet pages.
 * Also accepts a progress-like object for the silent-open case.
 * @param {unknown} input
 */
export function classifyWalletSyncStall(input) {
  // Silent open subscription shape from servicedesk#251 (related to #1381).
  if (
    input &&
    typeof input === 'object' &&
    input.isConnected === true &&
    typeof input.appliedIndex === 'number' &&
    typeof input.highestRelevantWalletIndex === 'number' &&
    input.appliedIndex < input.highestRelevantWalletIndex &&
    (input.silenceSeconds == null || input.silenceSeconds >= 60)
  ) {
    return result(
      'silent-open-subscription',
      'DUST (or other) subscription stays open with isConnected true but appliedIndex does not advance. Wallet SDK 1.2.0 never times out on inactivity (servicedesk#251). The official troubleshooting page requested by midnight-docs#1381 is still missing. This classifier does not open a socket.',
    );
  }

  const text = textOf(input);
  if (!text.trim()) {
    return result('empty', 'No sync symptom text to classify.');
  }

  if (/silent.*(subscription|open)|subscription.*silent|stops delivering events|isConnected.*true.*no events/i.test(text)) {
    return result(
      'silent-open-subscription',
      'Matches the silent-open subscription symptom in servicedesk#251. isConnected stays true while events stop. Related to the missing Preprod troubleshooting page in midnight-docs#1381.',
    );
  }

  if (/inserted non-linearly into dust commitment tree/i.test(text)) {
    return result(
      'dust-commitment-nonlinear',
      'Recorded dustWallet symptom on midnight-docs#1381. The published wallet guide does not document a recovery call for a non-linear dust commitment insert. This classifier does not replay dust history and does not fix the indexer.',
    );
  }

  if (/proof-server had no|provingServerUrl|proof server/i.test(text) && /sync|isSynced|stall/i.test(text)) {
    return result(
      'proof-server-not-in-symptom',
      `Issue 1381 records one self-diagnosis that the proof server was not running. The published Preprod sample sets provingServerUrl to ${WALLET_SYNC_DOCS.proofServerSample}. This lab pins ${WALLET_SYNC_DOCS.proofServerImage}. A missing local prover is not the same as FacadeState.isSynced, and this helper does not start Docker.`,
    );
  }

  if (/restore\s*\(|checkpoint/i.test(text)) {
    return result(
      'checkpoint-staleness-unpublished',
      'Issue 1381 asks how stale a checkpoint can be before restore() stops working. The wallet guide and acquire-tokens page cited here do not publish that bound. Do not invent one.',
    );
  }

  if (/waitForSyncedState/i.test(text)) {
    return result(
      'wait-for-synced-state',
      'waitForSyncedState() is the published gate before registration and balance reads. Acquire-tokens says a restarted script syncs again from the beginning, and that connected is not synced. No expected Preprod duration is published on that page.',
    );
  }

  if (/isSynced/i.test(text) && /never|false|not become|hang/i.test(text)) {
    return result(
      'connected-not-synced',
      'The acquire-tokens connectivity check expects isSynced to still be false after shielded, unshielded, and dust progress.isConnected are true. A hang after connect is the symptom midnight-docs#1381 tracks. It is not an indexer or node fix.',
    );
  }

  if (/dustWallet|dust channel|dust sync|DUST wallet/i.test(text)) {
    return result(
      'dust-leg',
      'WalletFacade.start wires a dust sub-wallet. Issue 1381 records dust-leg subscriptions that never connect, so isSynced stays false. The guide does not document a way to skip dust history replay.',
    );
  }

  return result(
    'not-a-recorded-sync-stall',
    'Text does not match the Preprod sync-stall symptoms recorded on midnight-docs#1381.',
  );
}

/** Self-check for the silent-open and text shapes. */
export function checkWalletSyncStall() {
  const failures = [];
  const silent = classifyWalletSyncStall({
    isConnected: true,
    appliedIndex: 10,
    highestRelevantWalletIndex: 42,
    silenceSeconds: 90,
  });
  if (silent.kind !== 'silent-open-subscription') failures.push('object silent');

  const textSilent = classifyWalletSyncStall('subscription stays open but stops delivering events');
  if (textSilent.kind !== 'silent-open-subscription') failures.push('text silent');

  const empty = classifyWalletSyncStall('');
  if (empty.kind !== 'empty') failures.push('empty');

  return {
    ok: failures.length === 0,
    failures,
    upstream: WALLET_SYNC_DOCS.upstream,
    credit: builderCredit,
  };
}

import { pathToFileURL } from 'node:url';
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkWalletSyncStall();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: WALLET_SYNC_DOCS.upstream, credit: builderCredit }, null, 2));
}
