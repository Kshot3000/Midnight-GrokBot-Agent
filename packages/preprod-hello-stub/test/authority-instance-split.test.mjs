import { describe, expect, it } from 'vitest';
import { splitAuthorityInstance } from '../src/authority-instance-split.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('servicedesk#236 authority instance split', () => {
  const opaque = new Error('Unexpected error: Error: expected instance of ContractMaintenanceAuthority');

  it('names a nested onchain copy when two paths are supplied', () => {
    const decoded = splitAuthorityInstance(opaque, {
      onchainCopies: [
        '/app/node_modules/@midnight-ntwrk/onchain-runtime-v3',
        '/app/contracts/node_modules/@midnight-ntwrk/onchain-runtime-v3',
      ],
    });
    expect(decoded.ok).toBe(false);
    expect(decoded.kind).toBe('nested-onchain-copy');
    expect(decoded.message).toContain('one copy');
    expect(decoded.message).toContain('3.0.0');
  });

  it('names the ledger-9 single-copy path without blaming a second runtime', () => {
    const decoded = splitAuthorityInstance(
      new Error('expected instance of ContractMaintenanceAuthority on ledger-9 offline deploy'),
      { onchainCopies: ['/app/node_modules/@midnight-ntwrk/onchain-runtime-v3'] },
    );
    expect(decoded.kind).toBe('ledger9-single-copy');
    expect(decoded.message).toContain('Ledger8DeployOnV9Error');
    expect(decoded.message).not.toContain('install one copy');
  });

  it('does not invent a cause when the text is not this error', () => {
    expect(splitAuthorityInstance(new Error('Custom error: 154')).ok).toBe(true);
  });
});
