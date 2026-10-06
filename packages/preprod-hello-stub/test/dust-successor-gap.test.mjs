import { describe, expect, it } from 'vitest';
import {
  classifyDustSuccessorGap,
  OFFICIAL_DUST_RECOVERY,
  SUCCESSOR_CLEARTEXT_FIELDS,
  UPSTREAM_DUST_SUCCESSOR,
} from '../src/dust-successor-gap.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const ISSUE_SHAPE = {
  publicEvent: {
    newCommitment: 'present',
    commitmentIndex: 989911,
    dustSpendProcessed: true,
  },
  cleartext: {},
  exportedUtxo: false,
  unrelatedGenerationUtxoPresent: true,
};

describe('dust successor gap', () => {
  it('names the public commitment that cannot rebuild the successor', () => {
    const result = classifyDustSuccessorGap(ISSUE_SHAPE);
    expect(result.classification).toBe('public-commitment-without-cleartext');
    expect(result.recoverableFromIndexerEvent).toBe(false);
    expect(result.missingCleartext).toEqual(SUCCESSOR_CLEARTEXT_FIELDS);
    expect(result.unrelatedGenerationUtxoPresent).toBe(true);
    expect(result.upstream).toBe(UPSTREAM_DUST_SUCCESSOR);
    expect(result.official).toBe(OFFICIAL_DUST_RECOVERY);
    expect(result.hint).toMatch(/does not fix the wallet, indexer, or node/i);
    expect(result.fixesIndexer).toBe(false);
  });

  it('does not treat an exported successor as the gap', () => {
    const result = classifyDustSuccessorGap({ ...ISSUE_SHAPE, exportedUtxo: true });
    expect(result.classification).toBe('successor-exported');
    expect(result.ok).toBe(true);
  });

  it('ignores an event with no commitment', () => {
    const result = classifyDustSuccessorGap({ publicEvent: { dustSpendProcessed: true } });
    expect(result.classification).toBe('no-public-commitment');
    expect(result.ok).toBe(false);
  });
});
