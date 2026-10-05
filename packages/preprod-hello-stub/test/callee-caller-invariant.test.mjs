import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkCalleeCallerSource } from '../src/callee-caller-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../contracts/hello-midnight/explicit-callee.compact'),
  'utf8',
);

describe('explicit callee caller invariant (servicedesk #202)', () => {
  it('accepts the lab source on the public language pin', () => {
    const result = checkCalleeCallerSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.upstream).toContain('servicedesk/issues/202');
  });

  it('rejects kernel.caller() on the 0.31 public pin', () => {
    const result = checkCalleeCallerSource('pragma language_version >= 0.23;\nkernel.caller();\n');
    expect(result.ok).toBe(false);
    expect(result.failures.join('\n')).toMatch(/kernel\.caller/);
  });
});
