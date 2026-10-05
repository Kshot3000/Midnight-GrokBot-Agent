import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkCompilerPin } from '../src/compiler-pin-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const hello = readFileSync(new URL('../../../contracts/hello-midnight/hello.compact', import.meta.url), 'utf8');

describe('compiler pin invariant', () => {
  it('accepts the lab hello contract language pin', () => {
    const result = checkCompilerPin(hello);
    expect(result.ok).toBe(true);
    expect(result.compiler).toBe('0.31.1');
    expect(result.language).toBe('0.23');
    expect(result.upstream).toContain('midnight-docs/issues/1245');
    expect(result.official).toContain('docs.midnight.network/tokens/unshielded-token');
  });

  it('rejects a 0.31.0 compact update pin', () => {
    const result = checkCompilerPin('compact update 0.31.0\n');
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/0\.31\.0/);
  });

  it('rejects a disclose-publishes claim', () => {
    const result = checkCompilerPin('// disclose() publishes the witness\npragma language_version 0.23;\n');
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/does not publish/);
  });

  it('rejects a language pin below 0.23', () => {
    const result = checkCompilerPin('pragma language_version 0.20;\n');
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/0\.23/);
  });
});
