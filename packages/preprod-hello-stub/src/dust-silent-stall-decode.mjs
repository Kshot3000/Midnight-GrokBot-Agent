/**
 * Classify a silent DUST subscription stall (isConnected stays true, appliedIndex does not advance).
 * Does not call the wallet SDK, indexer, or node.
 * Does not claim to fix the public indexer or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/251
 * Official: https://docs.midnight.network/sdks/official/wallet-developer-guide
 * Pins: wallet-sdk 1.2.0, midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_DUST_SILENT =
  'https://github.com/midnightntwrk/servicedesk/issues/251';
export const OFFICIAL_WALLET_GUIDE =
  'https://docs.midnight.network/sdks/official/wallet-developer-guide';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(input) {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    const parts = [];
    if (input.message) parts.push(String(input.message));
    if (input.isConnected !== undefined) parts.push(`isConnected=${input.isConnected}`);
    if (input.appliedIndex !== undefined) parts.push(`appliedIndex=${input.appliedIndex}`);
    if (input.highestRelevantWalletIndex !== undefined) parts.push(`highest=${input.highestRelevantWalletIndex}`);
    return parts.join(' ');
  }
  return String(input);
}

/**
 * @param {unknown} input log text or a progress-like object
 * @returns {{ ok: boolean, kind: string, hint: string }}
 */
export function classifyDustSilentStall(input) {
  const text = textOf(input);
  if (!text.trim()) {
    return { ok: false, kind: 'empty', hint: 'No input to classify.' };
  }

  const connected = /isConnected\s*=\s*true/i.test(text);
  const stalled =
    /appliedIndex.*(stayed|stalled|not advancing|unchanged)/i.test(text) ||
    /DUST stayed at/i.test(text) ||
    /silence clock/i.test(text) ||
    /nothing to apply/i.test(text);

  if (connected && stalled) {
    return {
      ok: true,
      kind: 'silent-subscription',
      hint: 'isConnected stayed true while the DUST appliedIndex did not advance. Wallet SDK 1.2.0 does not notice a quiet open subscription (servicedesk#251). Drop the connection or restart the wallet to resubscribe from the last appliedIndex. This lab helper does not fix the public indexer or node.',
    };
  }

  if (/dustLedgerEvents/i.test(text) && /stops delivering|quiet|silence/i.test(text)) {
    return {
      ok: true,
      kind: 'quiet-stream',
      hint: 'DUST subscription described as quiet or stopped delivering while remaining open. See servicedesk#251. Restart the wallet to force a resubscribe.',
    };
  }

  return {
    ok: false,
    kind: 'other',
    hint: 'Does not match the silent DUST subscription pattern from servicedesk#251.',
  };
}

function selfCheck() {
  const a = classifyDustSilentStall('state: dust 5890/1654335 isConnected=true isSynced=false\nDUST stayed at 5890..5890');
  const b = classifyDustSilentStall({ isConnected: true, appliedIndex: 5890, highestRelevantWalletIndex: 1654335, message: 'appliedIndex stalled' });
  const c = classifyDustSilentStall('isConnected=false');
  const ok = a.ok && a.kind === 'silent-subscription' && b.ok && !c.ok;
  console.log(ok ? 'PASS' : 'FAIL', a.kind, b.kind, c.ok);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
