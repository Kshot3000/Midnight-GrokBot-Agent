/**
 * proof-server-remote-align-1631.mjs — lab classifier for the remote-proving advice gap.
 *
 * Upstream: midnightntwrk/midnight-docs#1631
 * Official: https://docs.midnight.network/guides/local-proving
 *           https://docs.midnight.network/guides/run-proof-server
 *
 * Records only the published recommendation: prefer local proving; remote not recommended outside a TEE.
 * Does not invent APIs, does not contact a proof server, and does not claim to fix the public indexer or node.
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const REMOTE_PROVING_RECOMMENDATION = {
  prefer: 'local',
  remoteOutsideTee: 'not-recommended',
  source: 'https://docs.midnight.network/guides/local-proving',
  olderWording: 'https://docs.midnight.network/guides/run-proof-server',
  upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1631',
  pins: {
    compact: '~0.31.1',
    language: '~0.23',
    midnightJs: '4.1.1',
    dappConnector: '4.0.1',
    proofServer: '8.1.0',
  },
};

export function classifyProofServerLocation(location) {
  if (location === 'localhost' || location === '127.0.0.1' || location === 'local') {
    return { advice: 'recommended', reason: 'local proving keeps private inputs on the user machine' };
  }
  if (location === 'tee' || location === 'trusted-execution-environment') {
    return { advice: 'allowed-with-tee', reason: 'official docs allow remote only inside a TEE' };
  }
  return { advice: 'not-recommended', reason: 'remote proof servers receive private witness data in the clear' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(REMOTE_PROVING_RECOMMENDATION, null, 2));
  console.log(classifyProofServerLocation('localhost'));
  console.log(classifyProofServerLocation('remote'));
}
