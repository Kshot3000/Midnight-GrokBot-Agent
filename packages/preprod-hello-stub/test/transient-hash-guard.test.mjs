import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkTransientHashGuard } from '../src/transient-hash-guard.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(
  new URL('../../../contracts/hello-midnight/transient-hash-guard.compact', import.meta.url),
  'utf8',
);

describe('transientHash ledger guard', () => {
  it('keeps state on persistentHash and deserializes ShieldedSpend only', () => {
    const result = checkTransientHashGuard(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/1387/);
  });

  it('rejects a Boolean deserialize and a transientHash ledger write', () => {
    const bad = `
      pragma language_version >= 0.22 && <= 0.23;
      const flag_bool = disclose(deserialize<Boolean, 1>(flag));
      note = disclose(transientHash<Bytes<32>>(n));
    `;
    const result = checkTransientHashGuard(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/Boolean/);
    expect(result.failures.join(' ')).toMatch(/transientHash must not/);
  });
});
