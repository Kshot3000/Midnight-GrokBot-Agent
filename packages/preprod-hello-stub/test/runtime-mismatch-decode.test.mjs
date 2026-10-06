import { describe, expect, it } from 'vitest';
import { checkRuntimePin, decodeRuntimeMismatch, MATRIX_PINS } from '../src/runtime-mismatch-decode.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('servicedesk#236 deploy runtime mismatch', () => {
  it('names the coinPublicKey constructor failure as a runtime pin mismatch', () => {
    const error = new Error('ContractConfigurationError: Failed to configure constructor context with coin public key');
    error.cause = new TypeError("Cannot read properties of undefined (reading 'coinPublicKey')");
    const decoded = decodeRuntimeMismatch(error);
    expect(decoded.ok).toBe(false);
    expect(decoded.causes[0]).toContain(MATRIX_PINS.compactRuntime);
    expect(decoded.causes[0]).toContain('0.31.1');
    expect(decoded.upstream).toContain('servicedesk/issues/236');
  });

  it('names a second onchain-runtime-v3 copy', () => {
    const decoded = decodeRuntimeMismatch(new Error('Unexpected error: Error: expected instance of ContractMaintenanceAuthority'));
    expect(decoded.ok).toBe(false);
    expect(decoded.causes[0]).toContain('onchain-runtime-v3');
    expect(decoded.causes[0]).toContain(MATRIX_PINS.onchainRuntime);
  });

  it('accepts the matrix runtime pin and rejects 0.19.0 generated contracts', () => {
    expect(checkRuntimePin("checkRuntimeVersion('0.16.0')").ok).toBe(true);
    const bad = checkRuntimePin("checkRuntimeVersion('0.19.0')\n\"@midnight-ntwrk/compact-runtime\": \"0.19.0\"");
    expect(bad.ok).toBe(false);
    expect(bad.failures.length).toBeGreaterThan(0);
  });
});
