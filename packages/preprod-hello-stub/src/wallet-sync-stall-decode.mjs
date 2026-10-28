/**
 * Local classifier for Preprod wallet-sync stall symptoms reported in
 * midnightntwrk/midnight-docs#1381.
 * Matches phrases only. Does not call the indexer, node, or proof-server.
 * Does not invent APIs. Pins: Compact ~0.31.1 / language ~0.23,
 * midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const PATTERNS = [
  { id: 'isSynced-never-true', re: /isSynced|waitForSyncedState|never becomes true/i },
  { id: 'dust-non-linear-insert', re: /non-linear|dust commitment tree|expected index/i },
  { id: 'dust-sync-error', re: /dustWallet|dust sync|dust channel/i },
  { id: 'shielded-leg-silent', re: /shielded.*(?:never connect|subscriptions)/i },
];

export function classifyWalletSyncStall(message) {
  if (typeof message !== 'string' || !message.trim()) {
    return { matched: false, ids: [], note: 'empty message' };
  }
  const ids = PATTERNS.filter((p) => p.re.test(message)).map((p) => p.id);
  return {
    matched: ids.length > 0,
    ids,
    upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1381',
    docs: 'https://docs.midnight.network/guides/acquire-tokens',
  };
}
