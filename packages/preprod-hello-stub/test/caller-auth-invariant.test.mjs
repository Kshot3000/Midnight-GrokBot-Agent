import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkCallerAuthSource } from '../src/caller-auth-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(new URL('../../../contracts/hello-midnight/caller-auth.compact', import.meta.url), 'utf8');

describe('caller-auth compact invariant', () => {
  it('rejects ownPublicKey and requires a one-shot disclose claim', () => {
    const result = checkCallerAuthSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/902/);
  });

  it('flags a bypassable ownPublicKey assert', () => {
    const bad = 'export circuit withdraw(): [] { assert(ownPublicKey() == owner, "not owner"); }';
    const result = checkCallerAuthSource(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/ownPublicKey/);
  });
});
