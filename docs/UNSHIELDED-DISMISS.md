# Unshielded dismiss-time rejection (lab note)

Upstream: [midnightntwrk/servicedesk#117](https://github.com/midnightntwrk/servicedesk/issues/117)

Official error table: https://docs.midnight.network/nodes/error-codes

Official `receiveUnshielded` shape: https://docs.midnight.network/examples/contracts/private-guest-list

This lab does not submit a transaction and does not claim the public node, indexer, or ledger is fixed.

servicedesk#117 reports that a Compact circuit calling `receiveUnshielded` deploys, then the call is rejected as `1010: Invalid Transaction: Custom error: 231` with node text `Malformed(FeeCalculation(OutsideTimeToDismiss))`. The same report says a larger pure-state call was accepted, so the rejection was not explained by byte size. The published error table lists `168 FeeCalculation` and `155 FeeCalculationError`. It does not list `231`. The lab decoder keeps that distinction.

`contracts/unshielded-dismiss/unshielded.compact` is a language `>= 0.22 && <= 0.23` sketch. Arguments to `receiveUnshielded` are wrapped in `disclose`, matching the guest-list example. It is not compiled or deployed here.

Pins for this repo: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. The upstream repro used other versions; do not treat those as this lab's pin.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
