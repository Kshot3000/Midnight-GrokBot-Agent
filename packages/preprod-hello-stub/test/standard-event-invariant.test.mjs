import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkStandardEventSource } from '../src/standard-event-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(
  new URL('../../../contracts/hello-midnight/standard-event-emit.compact', import.meta.url),
  'utf8',
);

describe('standard event emit invariant', () => {
  it('emits ShieldedSpend from a circuit and decodes 32 bytes', () => {
    const result = checkStandardEventSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.event).toBe('ShieldedSpend');
    expect(result.serializedSize).toBe(32);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/1387/);
  });

  it('flags a custom struct, constructor emit, and missing disclose', () => {
    const bad = [
      'pragma language_version >= 0.23;',
      'import CompactStandardLibrary;',
      'struct PartyReady { size: Uint<64>; }',
      'constructor() { emit(PartyReady { size: 1 }); }',
      'export circuit spend(n: Bytes<32>): [] { emit(PartyReady { size: 1 }); }',
    ].join('\n');
    const result = checkStandardEventSource(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/constructor/);
    expect(result.failures.join(' ')).toMatch(/PartyReady/);
    expect(result.failures.join(' ')).toMatch(/disclose/);
    expect(result.failures.join(' ')).toMatch(/deserialize/);
  });
});
