import { describe, expect, it } from 'vitest';
import { classifyLedgerNotesGap, DOCUMENTED_LATEST, LAB_PROOF_SERVER, UNDOCUMENTED_TAG } from '../src/ledger-notes-gap.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('ledger notes gap', () => {
  it('keeps the lab pin while docs lag the 8.1.3 tag', () => {
    const result = classifyLedgerNotesGap();
    expect(result.classification).toBe('docs-behind-release-tag');
    expect(result.documentedLatest).toBe(DOCUMENTED_LATEST);
    expect(result.releaseTag).toBe(UNDOCUMENTED_TAG);
    expect(result.labProofServer).toBe(LAB_PROOF_SERVER);
    expect(result.tagInDocs).toBe(false);
    expect(result.upstream).toContain('midnight-docs/issues/1453');
    expect(result.docs).toContain('docs.midnight.network/relnotes/ledger');
    expect(result.hint).toMatch(/not a public indexer or node fix/i);
  });

  it('rejects a lab pin that follows the undocumented tag', () => {
    const result = classifyLedgerNotesGap({ labProofServer: '8.1.3' });
    expect(result.ok).toBe(false);
    expect(result.classification).toBe('lab-pin-follows-undocumented-tag');
  });

  it('aligns once the tag is on the documented list', () => {
    const result = classifyLedgerNotesGap({
      documentedLatest: '8.1.3',
      documentedVersions: ['8.1.3', '8.1.2'],
      releaseTag: '8.1.3',
      labProofServer: '8.1.0',
    });
    expect(result.classification).toBe('aligned');
    expect(result.tagInDocs).toBe(true);
  });

  it('fails closed on a non-version', () => {
    const result = classifyLedgerNotesGap({ documentedLatest: 'latest' });
    expect(result.classification).toBe('incomplete');
  });
});
