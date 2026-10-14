/**
 * Classify a proving setup description against the official privacy rule.
 * Does not open a connection, call midnight-js, contact a proof server,
 * or claim the public indexer or node is fixed.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1383
 * Official: https://docs.midnight.network/guides/local-proving
 *          https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PROVING_TOPOLOGY =
  'https://github.com/midnightntwrk/midnight-docs/issues/1383';
export const OFFICIAL_LOCAL_PROVING =
  'https://docs.midnight.network/guides/local-proving';
export const OFFICIAL_WALLETS =
  'https://docs.midnight.network/sdks/community/wallets/community-wallets-integration';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} description free-text description of the proving path
 * @returns {{ topology: string, witnessExposure: string, laceCompatible: boolean, hint: string }}
 */
export function classifyProvingTopology(description) {
  if (typeof description !== 'string') {
    return {
      topology: 'unknown',
      witnessExposure: 'unknown',
      laceCompatible: false,
      hint: 'Expected a string description.',
    };
  }
  const text = description.toLowerCase();

  if (/getprovingprovider|in-browser|wasm|1am/.test(text) && !/lace/.test(text)) {
    return {
      topology: 'wallet-delegated-or-in-browser',
      witnessExposure: 'stays with the wallet process (feature-detect getProvingProvider)',
      laceCompatible: false,
      hint: 'Official pages: feature-detect getProvingProvider. Lace does not expose it; fall back to a local proof server. (midnight-docs#1383)',
    };
  }

  if (/hosted|third.party|remote proof server|someone else/.test(text) && !/you control|encrypted channel/.test(text)) {
    return {
      topology: 'hosted-third-party',
      witnessExposure: 'proof server sees witness data',
      laceCompatible: false,
      hint: 'Official local-proving: hosted proof server defeats the purpose. The proof server receives private inputs. Prefer local or a machine you control over an encrypted channel.',
    };
  }

  if (/localhost:6300|local proof server|docker.*proof-server|lace/.test(text)) {
    return {
      topology: 'local-proof-server',
      witnessExposure: 'stays on the machine that runs the proof server',
      laceCompatible: true,
      hint: 'Matches the path Lace supports (Settings → Midnight → Local at http://localhost:6300) and the privacy rule in local-proving. Pins proof-server 8.1.0.',
    };
  }

  return {
    topology: 'unclassified',
    witnessExposure: 'unknown',
    laceCompatible: false,
    hint: 'See https://docs.midnight.network/guides/local-proving and the community wallets page. Do not send witnesses to a third-party hosted prover.',
  };
}

function selfCheck() {
  const local = classifyProvingTopology('Lace + local proof server at localhost:6300');
  const hosted = classifyProvingTopology('third-party hosted proof server');
  const delegated = classifyProvingTopology('wallet implements getProvingProvider in-browser WASM');
  const ok =
    local.topology === 'local-proof-server' &&
    local.laceCompatible === true &&
    hosted.topology === 'hosted-third-party' &&
    delegated.topology === 'wallet-delegated-or-in-browser';
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(JSON.stringify({ local, hosted, delegated }, null, 2));
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
