import { describe, expect, it } from 'vitest';
import {
  classifyMatrixRow,
  labPinCheck,
  builderCredit,
  DOCUMENTED_VERSIONS,
} from '../src/support-matrix-pins.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('classifyMatrixRow', () => {
  it('flags a Compact tag that is not compactc-v0.31.1', () => {
    const decoded = classifyMatrixRow({
      component: 'Compact toolchain',
      tag: '0.31.1',
      github: 'midnightntwrk/compact-devtools',
    });
    expect(decoded.ok).toBe(false);
    expect(decoded.kind).toBe('unresolved-matrix-field');
    expect(decoded.findings.join(' ')).toMatch(/compactc-v0\.31\.1/);
    expect(decoded.findings.join(' ')).toMatch(/LFDT-Minokawa\/compact/);
    expect(decoded.upstream).toMatch(/midnight-docs\/issues\/1494/);
    expect(decoded.docs).toBe('https://docs.midnight.network/relnotes/support-matrix');
  });

  it('treats midnight-js 4.1.1 as the version, not the v4.1.1 git tag', () => {
    const decoded = classifyMatrixRow({
      component: 'Midnight.js',
      tag: '4.1.1',
      github: 'midnightntwrk/midnight-js',
    });
    expect(decoded.ok).toBe(false);
    expect(decoded.findings.join(' ')).toMatch(/v4\.1\.1/);
  });

  it('flags the proof-server toolkit container recorded on issue 1494', () => {
    const decoded = classifyMatrixRow({
      component: 'Proof server',
      tag: 'proof-server-8.1.0',
      github: 'midnightntwrk/midnight-node',
      container: 'docker.io/midnightntwrk/midnight-node-toolkit',
    });
    expect(decoded.ok).toBe(false);
    expect(decoded.findings.join(' ')).toMatch(/midnight-ledger/);
    expect(decoded.findings.join(' ')).toMatch(/proof-server/);
  });

  it('flags a node row whose tag and containerTag disagree', () => {
    const decoded = classifyMatrixRow({
      component: 'Node',
      tag: 'node-1.0.400',
      container: 'docker.io/midnightntwrk/midnight-node-toolkit',
      containerTag: 'node-1.0.300',
    });
    expect(decoded.ok).toBe(false);
    expect(decoded.findings.join(' ')).toMatch(/toolkit/);
    expect(decoded.findings.join(' ')).toMatch(/containerTag/);
  });

  it('does not invent a finding for an aligned Compact release id', () => {
    const decoded = classifyMatrixRow({
      component: 'Compact toolchain',
      tag: 'compactc-v0.31.1',
      github: 'LFDT-Minokawa/compact',
    });
    expect(decoded.ok).toBe(true);
    expect(decoded.kind).toBe('aligned');
  });

  it('keeps lab pins on the published matrix versions', () => {
    const pins = labPinCheck();
    expect(pins.compactToolchain).toBe(DOCUMENTED_VERSIONS.compactToolchain);
    expect(pins.midnightJs).toBe('4.1.1');
    expect(pins.dappConnector).toBe('4.0.1');
    expect(pins.proofServer).toBe('8.1.0');
    expect(pins.language).toBe('0.23');
    expect(builderCredit).toContain('Email: kshot9000@gmail.com');
    expect(builderCredit).toContain('Built by @kshot9000 https://x.com/kshot9000');
  });
});
