/**
 * Compact runtime version gap reporter.
 * Cites midnightntwrk/midnight-docs#1564.
 * Does not invent APIs. Reports only the pins from the official support matrix
 * versus the version shown on the public Compact runtime API page.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const PINS = {
  compactToolchain: '0.31.1',
  compactLanguage: '0.23',
  compactRuntime: '0.16.0',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
  apiReferenceShows: '0.20.0',
};

export const UPSTREAM_ISSUE = 'https://github.com/midnightntwrk/midnight-docs/issues/1564';
export const MATRIX_URL = 'https://docs.midnight.network/relnotes/support-matrix';
export const API_URL = 'https://docs.midnight.network/api-reference/compact-runtime';

/**
 * @returns {{pins: typeof PINS, gap: boolean, warning: string, issue: string}}
 */
export function reportCompactRuntimeVersionGap() {
  const gap = PINS.apiReferenceShows !== PINS.compactRuntime;
  const warning = gap
    ? `API reference shows compact-runtime ${PINS.apiReferenceShows}; networks pin ${PINS.compactRuntime} (toolchain ${PINS.compactToolchain}). See ${UPSTREAM_ISSUE}.`
    : `API reference matches network pin ${PINS.compactRuntime}.`;
  return {
    pins: PINS,
    gap,
    warning,
    issue: UPSTREAM_ISSUE,
    matrix: MATRIX_URL,
    api: API_URL,
  };
}

export default reportCompactRuntimeVersionGap;
