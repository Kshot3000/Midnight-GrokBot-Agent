/**
 * Classify a Blockfrost project id prefix without storing the token.
 * Official networks page (read 2026-10-08):
 * https://docs.midnight.network/guides/networks-and-environments
 * A Midnight Mainnet project ID starts with nightmainnet. The 403 mismatch
 * row names nightpreview and nightpreprod as the other prefixes. The same
 * page still says preview and preprod endpoints are Midnight-hosted and
 * need no token. midnight-docs#1504 says those Preprod hosts shut down
 * Fri 9 Oct 2026, 18:00 ET / 22:00 UTC and that a preprod token is rejected
 * on mainnet. This helper does not call Blockfrost, the public indexer, or
 * the node, and does not claim either is fixed.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1504
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1504';
export const DOCS = 'https://docs.midnight.network/guides/networks-and-environments';

/** Prefixes named on the official networks page. Not a token. */
export const PREFIX = Object.freeze({
  mainnet: 'nightmainnet',
  preview: 'nightpreview',
  preprod: 'nightpreprod',
});

/** Official Preprod faucet. Not part of the indexer/RPC shutdown in #1504. */
export const PREPROD_FAUCET = 'https://midnight-tmnight-preprod.nethermind.dev/';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Keep only the documented prefix. Never return the rest of a project id.
 * @param {string} projectId
 */
export function redactProjectId(projectId) {
  const value = String(projectId || '').trim();
  const known = Object.values(PREFIX).find((prefix) => value.startsWith(prefix));
  if (!known) return { prefix: null, redacted: value ? 'unrecognized' : '' };
  return { prefix: known, redacted: `${known}…` };
}

/**
 * @param {string} projectId
 * @param {'preprod' | 'preview' | 'mainnet'} target
 */
export function classifyProjectPrefix(projectId, target = 'preprod') {
  const { prefix, redacted } = redactProjectId(projectId);
  const base = {
    upstream: UPSTREAM,
    docs: DOCS,
    faucet: PREPROD_FAUCET,
    claim: 'project-id prefix classification only — not an indexer or node fix',
    credit: CREDIT,
    redacted,
    target,
  };
  if (!prefix) {
    return {
      ...base,
      ok: false,
      classification: 'unrecognized-project-prefix',
      title: 'Project id does not start with a prefix named on the networks page',
      hint: 'Official docs say a Midnight Mainnet project ID starts with nightmainnet, and the mismatch row names nightpreview and nightpreprod. Do not log the full id.',
    };
  }
  if (prefix === PREFIX[target]) {
    return {
      ...base,
      ok: true,
      classification: 'prefix-matches-target',
      title: `Project id prefix matches ${target}`,
      hint: target === 'preprod'
        ? 'Official docs still say the preprod indexer and RPC are Midnight-hosted and need no token. midnight-docs#1504 proposes a separate Midnight Preprod Blockfrost project before the 9 Oct cutoff. This match is not a live endpoint check.'
        : 'Prefix matches the target named on the official networks page. This match is not a live endpoint check.',
    };
  }
  return {
    ...base,
    ok: false,
    classification: 'network-token-prefix-mismatch',
    title: `Project id prefix is ${prefix}, target is ${target}`,
    hint: 'The official 403 row says a nightpreprod or nightpreview token on mainnet is a network token mismatch. midnight-docs#1504 says a preprod token is rejected on mainnet and the other way round. Use one Blockfrost project per network. Do not commit the token.',
  };
}

export const preprodTokenPrefixCredit = CREDIT;
