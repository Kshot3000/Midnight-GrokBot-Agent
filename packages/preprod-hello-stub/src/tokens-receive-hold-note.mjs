/**
 * Lab note for contract receive/hold token patterns from official docs only.
 * Upstream: midnightntwrk/midnight-docs#1635
 * Does not invent APIs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const TOKENS_RECEIVE_HOLD = {
  upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1635',
  unshielded: {
    circuit: 'receiveUnshielded(color: Bytes<32>, amount: Uint<128>)',
    source: 'https://docs.midnight.network/tutorials/private-party/smart-contract',
    note: 'Caller wallet balances the transaction and supplies the funds.',
  },
  shielded: {
    receive: 'receiveShielded(coin: ShieldedCoinInfo)',
    hold: 'Map/Set.insertCoin(...) yields QualifiedShieldedCoinInfo with mt_index from current tx',
    source: 'https://docs.midnight.network/tutorials/private-tip-jar/smart-contract',
    note: 'Only for coins created in the same transaction; later spends use sendShielded.',
  },
};

export function describeReceiveHold() {
  return (
    `Unshielded: ${TOKENS_RECEIVE_HOLD.unshielded.circuit}. ` +
    `Shielded: ${TOKENS_RECEIVE_HOLD.shielded.receive} then ${TOKENS_RECEIVE_HOLD.shielded.hold}.`
  );
}
