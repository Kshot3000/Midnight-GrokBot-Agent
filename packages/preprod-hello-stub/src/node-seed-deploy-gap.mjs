/**
 * Classifies the missing Node seed-to-deploy guide.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1380
 * Official pages cited, not invented:
 *   https://docs.midnight.network/getting-started/hello-world
 *   https://docs.midnight.network/tokens/unshielded-token
 * Does not call wallet, indexer, or node APIs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1380';
export const HELLO_WORLD = 'https://docs.midnight.network/getting-started/hello-world';
export const UNSHIELDED = 'https://docs.midnight.network/tokens/unshielded-token';
export const PUBLIC_CLAIM = 'addresses only — wallet NOT funded, NOT deployed';

export function classifySeedDeployDocs(sample) {
  const hello = String(sample?.helloWorldText || '');
  const token = String(sample?.unshieldedText || '');
  const failures = [];
  if (!/yarn test:local/.test(hello)) {
    failures.push('hello-world page must still show yarn test:local');
  }
  if (/MIDNIGHT_SEED|withMnemonic|withSeed/.test(hello)) {
    failures.push('hello-world page must not be treated as the seed deploy guide');
  }
  if (!/pre-funded wallets/.test(hello)) {
    failures.push('hello-world page must still name pre-funded wallets');
  }
  if (!/MIDNIGHT_SEED/.test(token)) {
    failures.push('unshielded-token page is the published seed path, not a deploy guide');
  }
  if (sample?.serverDeployGuidePresent === true) {
    failures.push('do not claim midnight-docs#1380 is filled');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    helloWorld: HELLO_WORLD,
    unshieldedToken: UNSHIELDED,
    gap: 'seed to synced wallet to deploy is not a published Node guide',
  };
}

export function checkPublicWalletPayload(payload) {
  const failures = [];
  const body = payload && typeof payload === 'object' ? payload : {};
  if (Object.prototype.hasOwnProperty.call(body, 'mnemonic') || Object.prototype.hasOwnProperty.call(body, 'seed')) {
    failures.push('public payload must not carry mnemonic or seed');
  }
  if (body.claim !== PUBLIC_CLAIM) {
    failures.push('public claim must say addresses only, not funded, not deployed');
  }
  return { ok: failures.length === 0, failures, upstream: UPSTREAM };
}
