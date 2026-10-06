import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkNetworkIdSource } from '../src/network-id-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(new URL('../../../contracts/hello-midnight/no-network-id.compact', import.meta.url), 'utf8');

describe('in-circuit network id gap', () => {
  it('uses kernel.self bytes, ShieldedSpend emit, and Boolean deserialize', () => {
    const result = checkNetworkIdSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/1387/);
  });

  it('flags kernel.networkId, an event declaration, constructor emit, and transientHash state', () => {
    const bad = [
      'pragma language_version >= 0.23;',
      'import CompactStandardLibrary;',
      'event Flag { bit: Boolean }',
      'export ledger selfBytes: Bytes<32>;',
      'constructor() { emit(ShieldedSpend { nullifier: pad(32, "") }); }',
      'export circuit rememberSelf(): [] { selfBytes = disclose(kernel.networkId()); }',
      'export circuit noteSpend(n: Bytes<32>): [] { emit(Flag { bit: true }); }',
      'export circuit decodeFlag(flag: Bytes<1>): Boolean { return flag; }',
      'export circuit pin(x: Field): [] { selfBytes = disclose(transientHash(x)); }',
    ].join('\n');
    const result = checkNetworkIdSource(bad);
    expect(result.ok).toBe(false);
    const joined = result.failures.join(' ');
    expect(joined).toMatch(/networkId/);
    expect(joined).toMatch(/event is reserved/);
    expect(joined).toMatch(/constructor/);
    expect(joined).toMatch(/ShieldedSpend/);
    expect(joined).toMatch(/deserialize/);
    expect(joined).toMatch(/transientHash/);
  });
});
