/**
 * examples-scaffolder-note.mjs — classify published scaffolding paths.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1587
 * Official: https://docs.midnight.network/getting-started/quickstart
 *           https://docs.midnight.network/getting-started/hello-world
 *
 * Does not invent APIs, does not scaffold, does not compile, does not deploy.
 * LOCAL-TRUE. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function classifyScaffoldPath(text) {
  const s = String(text || '');
  if (/create-mn-app/.test(s)) {
    return { kind: 'create-mn-app', published: true, note: 'current quickstart uses create-mn-app' };
  }
  if (/example-hello-world/.test(s) || /midnight-examples/.test(s)) {
    return { kind: 'examples-clone', published: true, note: 'hello-world page and examples monorepo clone path' };
  }
  return { kind: 'unknown', published: false, note: 'no published scaffold path recognized' };
}

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1587';
export const PINS = {
  compact: '~0.31.1',
  language: '~0.23',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
};
