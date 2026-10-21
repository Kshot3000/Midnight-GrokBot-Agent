/**
 * Decode Compact "language version X.Y.Z mismatch" compiler errors.
 * Does not call a compiler, proof server, wallet, indexer, or node.
 * Does not invent APIs. Names and fix come from the official hello-world page.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official: https://docs.midnight.network/getting-started/hello-world
 * Pins: Compact ~0.31.1 / language ~0.23
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_LANGUAGE_MISMATCH =
  'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL_HELLO =
  'https://docs.midnight.network/getting-started/hello-world';
export const OFFICIAL_INSTALL =
  'https://docs.midnight.network/getting-started/installation';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {unknown} error
 */
export function decodeLanguageVersionMismatch(error) {
  const text = typeof error === 'string' ? error : (error && error.message) || String(error || '');
  const m = text.match(/language version\s+([0-9.]+)\s+mismatch/i);
  if (m) {
    const reported = m[1];
    return {
      ok: true,
      kind: 'language-version-mismatch',
      reported,
      hint: `Compiler reports language version ${reported} mismatch. The number is the version your compiler supports, not the one in the pragma. Official hello-world (toolchain 0.31.1) requires pragma language_version 0.23 and compact update 0.31.1. See getting-started/hello-world (midnight-docs#1487 samples also fail when pins drift).`,
      upstream: UPSTREAM_LANGUAGE_MISMATCH,
      official: OFFICIAL_HELLO,
      credit: CREDIT,
    };
  }
  return {
    ok: false,
    kind: 'other',
    hint: 'Not a language version mismatch message. Official pin is Compact toolchain 0.31.1 / language 0.23.',
    upstream: UPSTREAM_LANGUAGE_MISMATCH,
    official: OFFICIAL_INSTALL,
    credit: CREDIT,
  };
}

function selfCheck() {
  const hit = decodeLanguageVersionMismatch(
    'Exception: message.compact line 1 char 1: language version 0.22.0 mismatch',
  );
  const miss = decodeLanguageVersionMismatch('Failed Proof Server response');
  const ok = hit.ok && hit.reported === '0.22.0' && !miss.ok;
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
