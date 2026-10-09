/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { describe, expect, it } from 'vitest';
import { checkUnshieldedDismissLab, decodeUnshieldedDismiss } from '../src/unshielded-dismiss.mjs';

describe('servicedesk#117 unshielded dismiss-time text', () => {
  it('classifies the reported 231 sentence without inventing a published code', () => {
    const decoded = decodeUnshieldedDismiss('Custom error: 231 OutsideTimeToDismiss');
    expect(decoded.publishedTableHas231).toBe(false);
    expect(decoded.classification).toBe('reported-outside-time-to-dismiss');
  });

  it('keeps official 168 and the lab contract pin', () => {
    expect(checkUnshieldedDismissLab().ok).toBe(true);
  });
});
