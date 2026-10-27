/**
 * Decode the Compact compiler rejection of kernel.caller on the public pin.
 * Does not invoke compactc, a proof server, a wallet, an indexer, or a node.
 * Does not invent a kernel.caller API.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/202
 * Official: https://docs.midnight.network/relnotes/compact
 *           https://docs.midnight.network/relnotes/support-matrix
 * Pins: Compact ~0.31.1 / language ~0.23. kernel.caller is not in that pin.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_KERNEL_CALLER =
  'https://github.com/midnightntwrk/servicedesk/issues/202';
export const OFFICIAL_COMPACT_NOTES =
  'https://docs.midnight.network/relnotes/compact';
export const OFFICIAL_MATRIX =
  'https://docs.midnight.network/relnotes/support-matrix';

export const LAB_COMPACT = '~0.31.1';
export const LAB_LANGUAGE = '~0.23';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const CALLER_UNDEFINED =
  /operation caller undefined for ledger field type Kernel/i;

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') return error.message;
  return String(error);
}

/**
 * Classify a compiler message that rejects kernel.caller on the public Compact pin.
 * @param {unknown} error
 */
export function decodeKernelCallerUndefined(error) {
  const text = textOf(error);
  const hit = CALLER_UNDEFINED.test(text);
  if (!hit) {
    return {
      kind: 'unrecognized',
      ok: false,
      isKernelCallerUndefined: false,
      hint: 'Not the kernel.caller rejection. servicedesk#202 reports compactc: operation caller undefined for ledger field type Kernel on the public pin (Compact ~0.31.1 / language ~0.23). kernel.caller is not available there.',
      upstream: UPSTREAM_KERNEL_CALLER,
      official: OFFICIAL_COMPACT_NOTES,
      credit: CREDIT,
    };
  }
  return {
    kind: 'kernel-caller-undefined',
    ok: true,
    isKernelCallerUndefined: true,
    hint: 'compactc rejects kernel.caller() on Compact ~0.31.1 / language ~0.23 (public Preprod/Preview pin). The ledger may populate a caller slot, but Compact on this pin has no read. Do not invent the API. A public-network workaround is an explicit disclosed commitment plus an assert, not a kernel.caller call. Official notes still say use compact update 0.31 for contracts deployed today.',
    upstream: UPSTREAM_KERNEL_CALLER,
    official: OFFICIAL_MATRIX,
    compact: LAB_COMPACT,
    language: LAB_LANGUAGE,
    credit: CREDIT,
  };
}

/** Self-check. */
export function checkKernelCallerUndefined() {
  const failures = [];
  const hit = decodeKernelCallerUndefined(
    'compactc: operation caller undefined for ledger field type Kernel',
  );
  if (!hit.ok || !hit.isKernelCallerUndefined) {
    failures.push('must classify the reported compactc message');
  }
  const miss = decodeKernelCallerUndefined('failed assert: insufficient balance');
  if (miss.ok || miss.isKernelCallerUndefined) {
    failures.push('must reject unrelated assert text');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM_KERNEL_CALLER,
    official: OFFICIAL_COMPACT_NOTES,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const result = checkKernelCallerUndefined();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM_KERNEL_CALLER, credit: CREDIT }, null, 2));
}
