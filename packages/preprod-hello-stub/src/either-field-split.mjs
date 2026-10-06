/**
 * Either field spelling vs compiler pin.
 * Does not invoke compactc and does not invent a third field name.
 * Public docs (0.31.1 / language 0.23): isLeft
 *   https://docs.midnight.network/compact/standard-library/exports
 * Compiler 0.35 example (not the public-network pin): is_left
 *   https://github.com/LFDT-Minokawa/compact/issues/833
 * Upstream docs ticket: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_EITHER_FIELD = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const COMPACT_EITHER_FIELD = 'https://github.com/LFDT-Minokawa/compact/issues/833';
export const OFFICIAL_EITHER_FIELD = 'https://docs.midnight.network/compact/standard-library/exports';

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
 * Classify which Either tag a Compact source reads.
 * Public-network pin (language <= 0.23) must use isLeft, the name on
 * docs.midnight.network. A 0.35-shaped pragma must use is_left, the name
 * compact#833 checked with compiler 0.35.0. Mixing them is the failure.
 */
export function classifyEitherField(source) {
  const code = stripComments(source);
  const failures = [];
  const readsCamel = /\.isLeft\b/.test(code);
  const readsSnake = /\.is_left\b/.test(code);
  const publicPin = /pragma\s+language_version\s+>=\s*0\.22\s*&&\s*<=\s*0\.23\s*;/.test(code)
    || /pragma\s+language_version\s+0\.23(?:\.0)?\s*;/.test(code);
  const compiler035 = /pragma\s+language_version\s+>=\s*0\.27/.test(code)
    || /pragma\s+language_version\s+0\.27(?:\.0)?\s*;/.test(code);

  if (readsCamel && readsSnake) {
    failures.push('do not read both isLeft and is_left; they are different compiler pins');
  }
  if (!readsCamel && !readsSnake) {
    failures.push('read either isLeft (public docs / Compact 0.31.1) or is_left (compiler 0.35 example in compact#833)');
  }
  if (publicPin && readsSnake) {
    failures.push('public-network pin Compact ~0.31.1 follows docs.midnight.network isLeft; is_left is the compact#833 0.35 example');
  }
  if (compiler035 && readsCamel) {
    failures.push('compiler 0.35 example in compact#833 reads is_left; isLeft is the name still on docs.midnight.network');
  }
  if (compiler035 && publicPin) {
    failures.push('one file cannot pin both language 0.23 and language 0.27');
  }

  let pin = 'unknown';
  if (publicPin) pin = 'compact-0.31.1';
  else if (compiler035) pin = 'compact-0.35.0-example';

  let field = 'none';
  if (readsCamel && !readsSnake) field = 'isLeft';
  else if (readsSnake && !readsCamel) field = 'is_left';
  else if (readsCamel && readsSnake) field = 'mixed';

  return {
    ok: failures.length === 0 && pin !== 'unknown',
    failures,
    pin,
    field,
    upstream: UPSTREAM_EITHER_FIELD,
    compactIssue: COMPACT_EITHER_FIELD,
    official: OFFICIAL_EITHER_FIELD,
    credit: CREDIT,
  };
}
