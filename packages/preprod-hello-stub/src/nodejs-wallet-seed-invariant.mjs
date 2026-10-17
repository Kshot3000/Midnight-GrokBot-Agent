/**
 * Classify a local Node.js wallet-seed snippet against the official steps.
 * Official: https://docs.midnight.network/guides/acquire-tokens
 *           https://docs.midnight.network/guides/deploy-mn-app
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1380
 * Does not import wallet-sdk, does not connect, does not submit.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1380';
export const OFFICIAL = [
  'https://docs.midnight.network/guides/acquire-tokens',
  'https://docs.midnight.network/guides/deploy-mn-app',
];

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const REQUIRED = [
  'HDWallet.fromSeed',
  'setNetworkId',
  'Roles.Zswap',
  'Roles.NightExternal',
  'Roles.Dust',
  'WalletFacade',
];

/**
 * @param {string} source TypeScript/JavaScript the caller already has
 */
export function scanNodejsWalletSeed(source) {
  const text = String(source);
  const missing = REQUIRED.filter((name) => !text.includes(name));
  const ok = missing.length === 0;
  return {
    ok,
    kind: ok ? 'seed-to-facade-steps-present' : 'seed-to-facade-steps-missing',
    missing,
    upstream: UPSTREAM,
    official: OFFICIAL,
    pins: { compact: '0.31.1', language: '0.23', 'midnight-js': '4.1.1' },
    message: ok
      ? 'snippet names the official HDWallet.fromSeed, setNetworkId, three Roles, and WalletFacade steps'
      : `missing official names: ${missing.join(', ')}. See acquire-tokens and deploy-mn-app. This does not run the wallet.`,
    credit: CREDIT,
  };
}
