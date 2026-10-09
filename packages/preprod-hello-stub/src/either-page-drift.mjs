/**
 * Classify the Either field spelling against the public-network pin after the
 * standard-library page moved to is_left.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official page (read 2026-10-09, now is_left): https://docs.midnight.network/compact/standard-library/exports
 * Support matrix pin: https://docs.midnight.network/relnotes/support-matrix
 * Does not compile Compact and does not fix the public indexer or node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL = 'https://docs.midnight.network/compact/standard-library/exports';
export const MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const PAGE_READ = '2026-10-09';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * @param {string} source Compact source or a pasted docs excerpt
 * @param {{ pin?: string }} [opts]
 */
export function classifyEitherPageDrift(source, opts = {}) {
  const pin = opts.pin || '0.31.1';
  const code = stripComments(source);
  const hasSnake = /\bis_left\b/.test(code);
  const hasCamel = /\bisLeft\b/.test(code);
  const publicPin = pin === '0.31.1';

  if (publicPin && hasSnake && !hasCamel) {
    return {
      kind: 'page-spelling-on-public-pin',
      pin,
      pageField: 'is_left',
      pinField: 'isLeft',
      title: 'Synced stdlib page uses is_left; Compact 0.31.1 sample stays on isLeft',
      hint: 'midnight-docs#1387: the Compact repo renamed Either.isLeft to is_left. The docs.midnight.network standard-library page read 2026-10-09 now shows is_left. The support-matrix pin is still Compact 0.31.1 / language 0.23. Do not paste is_left into a public-network file. Constructors left and right are unchanged. This classifier does not compile and does not fix the public node.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      matrix: MATRIX,
    };
  }
  if (!publicPin && hasCamel && !hasSnake) {
    return {
      kind: 'pin-spelling-on-newer-compiler',
      pin,
      pageField: 'is_left',
      pinField: 'isLeft',
      title: 'isLeft is the 0.31.1 spelling, not the 0.35 / synced-page spelling',
      hint: 'A compiler newer than the public-network pin follows the synced page field is_left. Do not copy isLeft from the lab 0.31.1 sample.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      matrix: MATRIX,
    };
  }
  if (publicPin && hasCamel && !hasSnake) {
    return {
      kind: 'public-pin-spelling',
      pin,
      pageField: 'is_left',
      pinField: 'isLeft',
      title: 'isLeft matches the Compact 0.31.1 lab pin',
      hint: 'Keep isLeft on language <= 0.23. The official page read 2026-10-09 shows is_left; that page is not a drop-in for this pin.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      matrix: MATRIX,
    };
  }
  return {
    kind: 'not-either-field',
    pin,
    pageField: 'is_left',
    pinField: 'isLeft',
    title: 'No Either field spelling to classify',
    hint: 'Expected isLeft on the 0.31.1 pin or is_left on the synced page / 0.35 experiment.',
    upstream: UPSTREAM,
    official: OFFICIAL,
    matrix: MATRIX,
  };
}

export function checkEitherPageDrift() {
  const failures = [];
  const page = classifyEitherPageDrift('struct Either<A, B> { is_left: Boolean; left: A; right: B; }');
  if (page.kind !== 'page-spelling-on-public-pin') failures.push('synced page excerpt');
  if (page.pageField !== 'is_left') failures.push('page field');

  const pin = classifyEitherPageDrift('assert(choice.isLeft, "left() must set isLeft");');
  if (pin.kind !== 'public-pin-spelling') failures.push('0.31.1 sample');

  const newer = classifyEitherPageDrift('return e.isLeft ? e.left : 0;', { pin: '0.35.0' });
  if (newer.kind !== 'pin-spelling-on-newer-compiler') failures.push('0.35 camelCase');

  const snakeOk = classifyEitherPageDrift('return e.is_left ? e.left : 0;', { pin: '0.35.0' });
  if (snakeOk.kind === 'page-spelling-on-public-pin') failures.push('0.35 snake must not be flagged as the public pin');

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, pageRead: PAGE_READ, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkEitherPageDrift();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, pageRead: PAGE_READ, credit: CREDIT }, null, 2));
}
