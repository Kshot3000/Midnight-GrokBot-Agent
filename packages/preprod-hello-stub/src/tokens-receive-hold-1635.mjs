/**
 * tokens-receive-hold-1635.mjs
 *
 * Lab checklist for midnight-docs#1635 (Tokens pages: how a contract receives and holds tokens).
 * Official docs only. No invented APIs. No network calls.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1635';

export const OFFICIAL = Object.freeze({
  tokensOverview: 'https://docs.midnight.network/tokens/overview',
  stdlib: 'https://docs.midnight.network/compact/standard-library/exports',
  tokenTransfers: 'https://docs.midnight.network/examples/contracts/token-transfers',
  privateParty: 'https://docs.midnight.network/tutorials/private-party/smart-contract',
  privateTipJar: 'https://docs.midnight.network/tutorials/private-tip-jar/smart-contract',
});

export const CHECKLIST = Object.freeze([
  'Unshielded: circuit calls receiveUnshielded(color, amount); wallet balances and pays.',
  'NIGHT is unshielded; use nativeToken() or default<Bytes<32>> as documented.',
  'Shielded: DApp builds a fresh ShieldedCoinInfo; circuit calls receiveShielded(disclose(coin)).',
  'Custody: Map/Set of QualifiedShieldedCoinInfo + insertCoin (or writeCoin) in the same tx stores mt_index.',
  'Indexer is for coins from an earlier transaction; same-tx receive/mint does not need it.',
  'Tokens overview currently names receiveShielded without the custody pattern; tutorials cover it.',
]);

export function describe() {
  return {
    upstream: UPSTREAM,
    official: OFFICIAL,
    checklist: CHECKLIST,
    pins: {
      compact: '~0.31.1',
      language: '~0.23',
      midnightJs: '4.1.1',
      dappConnector: '4.0.1',
      proofServer: '8.1.0',
    },
    localTrue: true,
  };
}

export default describe;
