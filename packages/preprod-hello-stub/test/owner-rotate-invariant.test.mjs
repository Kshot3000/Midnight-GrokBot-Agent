import { describe, expect, it } from 'vitest';
import { checkLabOwnerRotate, checkOwnerRotate } from '../src/owner-rotate-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('owner rotate invariant', () => {
  it('accepts the lab circuit', () => {
    const result = checkLabOwnerRotate();
    expect(result.ok, result.failures.join('; ')).toBe(true);
    expect(result.upstream).toContain('midnight-docs/issues/902');
  });

  it('rejects an ownPublicKey gate', () => {
    const bad = `
      pragma language_version >= 0.23;
      export ledger owner: Bytes<32>;
      witness secretKey(): Bytes<32>;
      export circuit rotateOwner(newOwner: Bytes<32>): [] {
        assert(ownPublicKey().bytes == owner, "not owner");
        owner = disclose(newOwner);
      }
    `;
    const result = checkOwnerRotate(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.some((line) => line.includes('ownPublicKey'))).toBe(true);
  });
});
