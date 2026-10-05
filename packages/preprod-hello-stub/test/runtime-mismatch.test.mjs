import { describe, expect, it } from 'vitest';
import { decodeRuntimeMismatch, builderCredit, SUPPORT_MATRIX } from '../src/runtime-mismatch.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('decodeRuntimeMismatch', () => {
  it('names the coinPublicKey constructor failure as a runtime version mismatch', () => {
    const err = new Error('Failed to configure constructor context with coin public key');
    err.name = 'ContractConfigurationError';
    err.cause = new TypeError("Cannot read properties of undefined (reading 'coinPublicKey')");
    const decoded = decodeRuntimeMismatch(err);
    expect(decoded.kind).toBe('runtime-version');
    expect(decoded.hint).toMatch(/compact-runtime 0\.16\.0/);
    expect(decoded.hint).toMatch(/0\.31\.1/);
    expect(decoded.upstream).toMatch(/servicedesk\/issues\/236/);
    expect(decoded.docs).toBe(SUPPORT_MATRIX.docs);
  });

  it('names ContractMaintenanceAuthority as a second onchain-runtime-v3 copy', () => {
    const decoded = decodeRuntimeMismatch(
      'Unexpected error: Error: expected instance of ContractMaintenanceAuthority',
    );
    expect(decoded.kind).toBe('duplicate-onchain-runtime');
    expect(decoded.hint).toMatch(/onchain-runtime-v3/);
    expect(decoded.hint).toMatch(/3\.0\.0/);
    expect(decoded.docs).toBe(SUPPORT_MATRIX.howTo);
  });

  it('does not claim an unrelated submit error is a runtime mismatch', () => {
    const decoded = decodeRuntimeMismatch('Transaction submission error: 1010');
    expect(decoded.kind).toBe('not-runtime-mismatch');
  });

  it('keeps the lab credit block and matrix pins', () => {
    expect(builderCredit).toContain('Email: kshot9000@gmail.com');
    expect(builderCredit).toContain('Built by @kshot9000 https://x.com/kshot9000');
    expect(SUPPORT_MATRIX.midnightJs).toBe('4.1.1');
    expect(SUPPORT_MATRIX.compactRuntime).toBe('0.16.0');
  });
});
