/**
 * Upstream open issues index for 2026-10-15.
 *
 * Exports the list of open issues read this run from the three orgs this lab
 * cannot push to. Does not invent APIs. Does not claim a public indexer, node,
 * or proof-server fix. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0. Official docs: https://docs.midnight.network/.
 *
 * Upstream snapshot: this file cites the open issues listed in
 * docs/UPSTREAM-OPEN-ISSUES-2026-10-15.md.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_OPEN_ISSUES_2026_10_15 = {
  readOn: '2026-10-15',
  servicedesk: [
    { number: 252, title: 'proof-server 9.0.0-rc.9 DUST-spend proofs rejected by Stagenet node 2.0.0 (1010 Custom error 170)', url: 'https://github.com/midnightntwrk/servicedesk/issues/252' },
    { number: 251, title: 'Wallet SDK DUST sync never notices a subscription that stays open but stops delivering events', url: 'https://github.com/midnightntwrk/servicedesk/issues/251' },
    { number: 249, title: 'pure circuits in contract types compile but every call is refused; CoIP 4 omits PureInterfaceCircuit', url: 'https://github.com/midnightntwrk/servicedesk/issues/249' },
    { number: 243, title: 'midnight-js proof provider drops the proof server\'s error message, and reports a timeout as "The user aborted a request."', url: 'https://github.com/midnightntwrk/servicedesk/issues/243' },
    { number: 242, title: 'proof-server image silently drops command-line flags, and exits at startup if one key download fails three times in a row', url: 'https://github.com/midnightntwrk/servicedesk/issues/242' },
  ],
  midnightDocs: [
    { number: 1554, title: 'Add a guide for wallet builders: Wallet SDK plus implementing the DApp Connector API', url: 'https://github.com/midnightntwrk/midnight-docs/issues/1554' },
    { number: 1527, title: 'docs: proof-server docker run and Compose commands silently drop their flags', url: 'https://github.com/midnightntwrk/midnight-docs/issues/1527' },
    { number: 1487, title: 'Test and debug page: code samples don\'t run as written', url: 'https://github.com/midnightntwrk/midnight-docs/issues/1487' },
  ],
  exampleHelloWorld: [
    { number: 41, title: 'chore: remove unused dependencies (axios, testcontainers)', url: 'https://github.com/midnightntwrk/example-hello-world/issues/41' },
    { number: 13, title: 'Dependency Dashboard', url: 'https://github.com/midnightntwrk/example-hello-world/issues/13' },
  ],
  pins: {
    compact: '~0.31.1',
    language: '~0.23',
    midnightJs: '4.1.1',
    dappConnector: '4.0.1',
    proofServer: '8.1.0',
  },
  officialDocs: 'https://docs.midnight.network/',
};

export function listOpenUpstreamIssues() {
  return [
    ...UPSTREAM_OPEN_ISSUES_2026_10_15.servicedesk,
    ...UPSTREAM_OPEN_ISSUES_2026_10_15.midnightDocs,
    ...UPSTREAM_OPEN_ISSUES_2026_10_15.exampleHelloWorld,
  ];
}
