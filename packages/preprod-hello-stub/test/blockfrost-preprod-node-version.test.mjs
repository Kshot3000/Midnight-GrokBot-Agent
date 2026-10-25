/**
 * Tests for the Blockfrost Preprod node version classifier.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/267
 * Official: https://docs.midnight.network/relnotes/support-matrix
 * Does not call any public RPC, indexer, or node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { describe, it, expect } from 'vitest';
import {
  BLOCKFROST_PREPROD_NODE,
  classifyBlockfrostPreprodNodeVersion,
} from '../src/blockfrost-preprod-node-version.mjs';

describe('blockfrost preprod node version (servicedesk#267)', () => {
  it('records the official pin and the reported string', () => {
    expect(BLOCKFROST_PREPROD_NODE.officialNode).toBe('1.0.400');
    expect(BLOCKFROST_PREPROD_NODE.officialSpecVersion).toBe(1000300);
    expect(BLOCKFROST_PREPROD_NODE.reportedBlockfrost).toBe('2.1.0-00000000000');
    expect(BLOCKFROST_PREPROD_NODE.upstream).toContain('267');
  });

  it('classifies the official pin', () => {
    const r = classifyBlockfrostPreprodNodeVersion('1.0.400-c338b9ac');
    expect(r.ok).toBe(true);
    expect(r.matchesOfficial).toBe(true);
    expect(r.matchesReported).toBe(false);
  });

  it('classifies the reported Blockfrost string', () => {
    const r = classifyBlockfrostPreprodNodeVersion('2.1.0-00000000000');
    expect(r.ok).toBe(true);
    expect(r.matchesOfficial).toBe(false);
    expect(r.matchesReported).toBe(true);
    expect(r.note).toMatch(/specVersion is still reported as 1000300/);
  });

  it('rejects an unknown string', () => {
    const r = classifyBlockfrostPreprodNodeVersion('9.9.9-deadbeef');
    expect(r.ok).toBe(false);
  });
});
