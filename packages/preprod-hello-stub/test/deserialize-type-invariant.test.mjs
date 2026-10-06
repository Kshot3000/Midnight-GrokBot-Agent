import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkDeserializeTypeSource } from '../src/deserialize-type-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(
  new URL('../../../contracts/hello-midnight/deserialize-type.compact', import.meta.url),
  'utf8',
);

describe('deserialize return type invariant', () => {
  it('types the official ShieldedSpend example as T', () => {
    const result = checkDeserializeTypeSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.returnType).toBe('T');
    expect(result.upstream).toMatch(/midnight-docs\/issues\/1387/);
  });

  it('rejects a Boolean deserialize and a typed disclose', () => {
    const bad = [
      'pragma language_version >= 0.23;',
      'export circuit bad(flag: Bytes<1>): Boolean {',
      '  return disclose<Boolean>(deserialize<Boolean, 1>(flag));',
      '}',
    ].join('\n');
    const result = checkDeserializeTypeSource(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/Boolean/);
    expect(result.failures.join(' ')).toMatch(/type constructor/);
  });
});
