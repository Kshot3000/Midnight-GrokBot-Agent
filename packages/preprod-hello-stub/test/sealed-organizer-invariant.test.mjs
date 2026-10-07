import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkSealedOrganizerSource } from '../src/sealed-organizer-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(
  new URL('../../../contracts/hello-midnight/sealed-organizer.compact', import.meta.url),
  'utf8',
);

describe('sealed organizer invariant', () => {
  it('sets sealed organizer only in the constructor and does not use ownPublicKey', () => {
    const result = checkSealedOrganizerSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.sealed).toEqual(['organizer']);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/902/);
  });

  it('flags a circuit rewrite of a sealed field and ownPublicKey auth', () => {
    const bad = [
      'pragma language_version >= 0.23;',
      'export sealed ledger organizer: Bytes<32>;',
      'constructor() { organizer = disclose(pad(32, "x")); }',
      'export circuit steal(): [] {',
      '  organizer = ownPublicKey().bytes;',
      '}',
    ].join('\n');
    const result = checkSealedOrganizerSource(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/outside the constructor/);
    expect(result.failures.join(' ')).toMatch(/ownPublicKey/);
  });
});
