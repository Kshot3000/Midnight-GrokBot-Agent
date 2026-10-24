/**
 * Official Preprod Blockfrost migration mapping (no network calls).
 * Cites midnightntwrk/servicedesk#270.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

/** @typedef {{ service: string, old: string, neu: string }} MigrationRow */

/** @type {readonly MigrationRow[]} */
export const PREPROD_MIGRATION = Object.freeze([
  {
    service: 'Indexer (GraphQL)',
    old: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    neu: 'https://midnight-preprod.blockfrost.io/api/v0',
  },
  {
    service: 'Indexer (WebSocket)',
    old: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    neu: 'wss://midnight-preprod.blockfrost.io/api/v0/ws',
  },
  {
    service: 'Node RPC',
    old: 'https://rpc.preprod.midnight.network',
    neu: 'https://rpc.midnight-preprod.blockfrost.io',
  },
  {
    service: 'Node WebSocket',
    old: 'wss://rpc.preprod.midnight.network',
    neu: 'wss://rpc.midnight-preprod.blockfrost.io',
  },
]);

const RETIRED = new Set([
  'indexer.preprod.midnight.network',
  'rpc.preprod.midnight.network',
  'indexer.mainnet.midnight.network',
  'rpc.mainnet.midnight.network',
]);

/**
 * Classify a hostname or URL against the official retired set.
 * @param {string} input
 * @returns {{ retired: boolean, hostname: string | null, hint: string }}
 */
export function classifyRetiredHost(input) {
  if (typeof input !== 'string' || !input) {
    return { retired: false, hostname: null, hint: 'empty input' };
  }
  let hostname = input;
  try {
    const u = new URL(input.includes('://') ? input : `https://${input}`);
    hostname = u.hostname;
  } catch {
    /* keep raw */
  }
  const retired = RETIRED.has(hostname);
  const hint = retired
    ? 'Retired Midnight-hosted endpoint. Replace with Blockfrost equivalent and append ?project_id=<token> from a project for the same network. See docs.midnight.network/guides/networks-and-environments#migrating-from-the-midnight-hosted-mainnet-endpoints'
    : 'Not a known retired Midnight-hosted hostname.';
  return { retired, hostname, hint };
}

// Self-check (no side effects when imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  const samples = [
    'https://indexer.preprod.midnight.network/api/v4/graphql',
    'https://midnight-preprod.blockfrost.io/api/v0',
    'rpc.mainnet.midnight.network',
  ];
  for (const s of samples) {
    console.log(s, classifyRetiredHost(s));
  }
  console.log('PREPROD_MIGRATION rows:', PREPROD_MIGRATION.length);
}
