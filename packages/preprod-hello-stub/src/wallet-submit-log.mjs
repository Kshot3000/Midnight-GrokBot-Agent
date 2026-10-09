/**
 * Replace the official 1010 how-to JavaScript sample with the wallet submit
 * logging path named in midnight-docs#1509. Does not call a wallet, submit a
 * transaction, or change the public docs page.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Official sample page: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 * Official wallet submit: https://docs.midnight.network/api-reference/wallet-sdk
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';
export const OFFICIAL = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';
export const WALLET_SDK = 'https://docs.midnight.network/api-reference/wallet-sdk';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Sample still published on the how-to page (checked 2026-10-09). */
export const OFFICIAL_SIGN_AND_SEND = 'await api.tx.someCall().signAndSend(account);';

/**
 * Replacement named by midnight-docs#1509. `wallet.submitTransaction` is the
 * call used in the official Wallet SDK reference. Log `String(err)`, not
 * `JSON.stringify(err)`, because the how-to says stringify prints `{}`.
 */
export const WALLET_SUBMIT_LOG = `try {
  await wallet.submitTransaction(tx);
} catch (err) {
  console.error(String(err));
}`;

export function classifySubmitSample(source) {
  const text = String(source ?? '');
  if (/signAndSend\s*\(/.test(text) || /api\.tx\.someCall/.test(text)) {
    return {
      kind: 'replace-sign-and-send',
      usesMidnightSubmit: false,
      title: 'How-to sample uses polkadot.js signAndSend',
      hint: 'midnight-docs#1509: Midnight DApps do not submit with api.tx.someCall().signAndSend(account). Use wallet.submitTransaction(tx) and log String(err). This helper does not call a wallet.',
      replacement: WALLET_SUBMIT_LOG,
      upstream: UPSTREAM,
      official: OFFICIAL,
      walletSdk: WALLET_SDK,
    };
  }
  if (/wallet\.submitTransaction\s*\(/.test(text) && /String\s*\(\s*err\s*\)/.test(text)) {
    return {
      kind: 'wallet-submit-string-log',
      usesMidnightSubmit: true,
      title: 'Wallet submit path logs String(err)',
      hint: 'Matches the logging shape midnight-docs#1509 asks for. JSON.stringify on this error loses the code.',
      replacement: WALLET_SUBMIT_LOG,
      upstream: UPSTREAM,
      official: OFFICIAL,
      walletSdk: WALLET_SDK,
    };
  }
  return {
    kind: 'not-this-sample',
    usesMidnightSubmit: false,
    title: 'Not the 1010 how-to submit sample',
    hint: 'No signAndSend sample and no wallet.submitTransaction plus String(err) pair.',
    replacement: WALLET_SUBMIT_LOG,
    upstream: UPSTREAM,
    official: OFFICIAL,
    walletSdk: WALLET_SDK,
  };
}

export function checkWalletSubmitLog() {
  const failures = [];
  const gap = classifySubmitSample(OFFICIAL_SIGN_AND_SEND);
  if (gap.kind !== 'replace-sign-and-send') failures.push('official sample kind');
  if (gap.usesMidnightSubmit) failures.push('signAndSend must not count as Midnight submit');
  if (!gap.replacement.includes('wallet.submitTransaction(tx)')) failures.push('replacement must name wallet.submitTransaction');
  if (!gap.replacement.includes('String(err)')) failures.push('replacement must log String(err)');
  if (gap.replacement.includes('signAndSend')) failures.push('replacement must not keep signAndSend');

  const ok = classifySubmitSample(WALLET_SUBMIT_LOG);
  if (ok.kind !== 'wallet-submit-string-log' || !ok.usesMidnightSubmit) failures.push('wallet path kind');

  const other = classifySubmitSample('console.log(JSON.stringify(err))');
  if (other.kind !== 'not-this-sample') failures.push('stringify-only is not the wallet path');

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkWalletSubmitLog();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
