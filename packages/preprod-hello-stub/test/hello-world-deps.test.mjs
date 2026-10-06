import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { classifyHelloWorldDeps } from '../src/hello-world-deps.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const labPackage = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

const upstreamSnapshot = {
  dependencies: {
    '@midnight-ntwrk/midnight-js-http-client-proof-provider': '4.1.1',
    '@midnight-ntwrk/midnight-js-contracts': '4.1.1',
    axios: '^1.15.0',
    testcontainers: '^11.13.0',
  },
};

describe('hello-world unused prove deps', () => {
  it('names axios and testcontainers as unused for the documented prove path', () => {
    const result = classifyHelloWorldDeps(upstreamSnapshot, {
      labDependencies: labPackage.dependencies,
    });
    expect(result.ok).toBe(true);
    expect(result.stillListedUpstream).toEqual(['axios', 'testcontainers']);
    expect(result.proofServer).toBe('midnightntwrk/proof-server:8.1.0');
    expect(result.midnightJs).toBe('4.1.1');
    expect(result.upstream).toContain('example-hello-world/issues/41');
    expect(result.official).toContain('docs.midnight.network/getting-started/installation');
  });

  it('fails if the lab package pulls axios', () => {
    const result = classifyHelloWorldDeps(upstreamSnapshot, {
      labDependencies: { axios: '^1.15.0' },
    });
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/axios/);
  });

  it('fails if the proof provider package is missing from the example snapshot', () => {
    const result = classifyHelloWorldDeps({ dependencies: { axios: '^1.15.0' } });
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/midnight-js-http-client-proof-provider/);
  });
});
