import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decodeStagenetStall, UPSTREAM_STALL } from '../src/stagenet-stall-decode.mjs';

describe('stagenet stall decode', () => {
  it('classifies the exact message from servicedesk#264', () => {
    const result = decodeStagenetStall('Unable to get requested contract state');
    assert.equal(result.ok, true);
    assert.equal(result.kind, 'stagenet-validator-stall');
    assert.equal(result.upstream, UPSTREAM_STALL);
    assert.match(result.hint, /retry/i);
    assert.match(result.credit, /kshot9000@gmail.com/);
  });

  it('rejects unrelated text', () => {
    const result = decodeStagenetStall('1010: Invalid Transaction');
    assert.equal(result.ok, false);
    assert.equal(result.kind, 'unrecognized');
  });
});

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
