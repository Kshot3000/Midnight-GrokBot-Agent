/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { describe, it, expect } from 'vitest';
import { classifyConstructorCount } from '../src/constructor-once.mjs';

describe('constructor once', () => {
  it('rejects a second constructor', () => {
    const result = classifyConstructorCount('constructor() {}\nconstructor() {}');
    expect(result.ok).toBe(false);
    expect(result.kind).toBe('too-many-constructors');
  });
});
