/**
 * Snapshot of open upstream issues read 2026-10-28.
 * Does not invent APIs. Does not claim a fix of the public indexer or node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const OPEN_ISSUES_2026_10_28 = Object.freeze([
  { org: 'midnightntwrk/servicedesk', number: 267, title: 'Which node build does Blockfrost preprod RPC run? It reports "2.1.0-00000000000"', lab: 'docs/BLOCKFROST-PREPROD-NODE-VERSION.md' },
  { org: 'midnightntwrk/servicedesk', number: 266, title: 'Explicit disclosure: circuit return values are not in the published transaction', lab: 'docs/CIRCUIT-RETURN-DISCLOSURE.md' },
  { org: 'midnightntwrk/servicedesk', number: 254, title: 'Faucet POST /drips multiplies amount by 5 tNIGHT', lab: 'docs/FAUCET-AMOUNT-UNIT.md' },
  { org: 'midnightntwrk/midnight-docs', number: 1587, title: 'Replace the Quickstart page create-mn-app content', lab: 'docs/QUICKSTART-CREATE-MN-APP-GAP.md' },
  { org: 'midnightntwrk/midnight-docs', number: 1564, title: 'Compact runtime API reference documents 0.20.0, networks run 0.16.0', lab: 'docs/COMPACT-RUNTIME-API-VERSION-GAP.md' },
  { org: 'midnightntwrk/midnight-docs', number: 1487, title: 'Test and debug page code samples do not run as written', lab: 'docs/CIRCUIT-CONTEXT-SAMPLE.md' },
  { org: 'midnightntwrk/midnight-docs', number: 1383, title: 'Document proving topology', lab: 'docs/PROVING-TOPOLOGY.md' },
  { org: 'midnightntwrk/example-hello-world', number: 41, title: 'remove unused dependencies (axios, testcontainers)', lab: 'docs/HELLO-WORLD-UNUSED-DEPS.md' },
]);

export function summarizeOpenIssues() {
  return {
    date: '2026-10-28',
    count: OPEN_ISSUES_2026_10_28.length,
    pins: {
      compact: '~0.31.1',
      language: '~0.23',
      midnightJs: '4.1.1',
      dappConnector: '4.0.1',
      proofServer: '8.1.0',
    },
    issues: OPEN_ISSUES_2026_10_28,
    note: 'LOCAL-TRUE. Does not claim a fix of the public indexer or node.',
  };
}
