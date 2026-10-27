import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyInitSwapPartial,
  INITSWAP_PARTIAL_DOCS,
  builderCredit,
} from '../src/initswap-partial-decode.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('classifyInitSwapPartial', () => {
  it('flags missing unshielded inputs when unshielded outputs exist', () => {
    const result = classifyInitSwapPartial({
      inputs: { shielded: {} },
      outputs: [{ type: 'unshielded' }],
    });
    assert.equal(result.risk, true);
    assert.deepEqual(result.missing, ['unshielded']);
    assert.match(result.note, /servicedesk#99/);
    assert.equal(result.upstream, INITSWAP_PARTIAL_DOCS.upstream);
  });

  it('flags missing shielded inputs when shielded outputs exist', () => {
    const result = classifyInitSwapPartial({
      inputs: { unshielded: {} },
      outputs: [{ type: 'shielded' }],
    });
    assert.equal(result.risk, true);
    assert.deepEqual(result.missing, ['shielded']);
  });

  it('does not flag when both input keys are present', () => {
    const result = classifyInitSwapPartial({
      inputs: { shielded: {}, unshielded: {} },
      outputs: [{ type: 'shielded' }, { type: 'unshielded' }],
    });
    assert.equal(result.risk, false);
    assert.deepEqual(result.missing, []);
  });

  it('does not flag when no mixed outputs', () => {
    const result = classifyInitSwapPartial({
      inputs: { shielded: { t: 1n } },
      outputs: [{ type: 'shielded' }],
    });
    assert.equal(result.risk, false);
  });

  it('keeps the credit block', () => {
    assert.match(builderCredit, /Email: kshot9000@gmail.com/);
    assert.match(builderCredit, /addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v/);
  });
});
