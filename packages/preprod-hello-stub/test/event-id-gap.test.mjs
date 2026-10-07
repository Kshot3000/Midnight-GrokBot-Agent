import { describe, expect, it } from 'vitest';
import {
  classifyEventIdSequence,
  decodeDustTreeInsert,
  eventIdGapCredit,
  REPORTED_PREPROD_EVENT_SKIP,
} from '../src/event-id-gap.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('classifyEventIdSequence', () => {
  it('labels the reported Preprod skip and refuses a hand-shifted cursor', () => {
    const result = classifyEventIdSequence({
      eventIds: [989780, 989803],
    });
    expect(result.ok).toBe(false);
    expect(result.classification).toBe('reported-preprod-skip');
    expect(result.gaps[0].missing).toBe(22);
    expect(result.hint).toMatch(/Do not shift cursors/);
    expect(result.hint).toMatch(/servicedesk#216/);
    expect(result.hint).toMatch(/Not a public indexer or node fix/);
    expect(result.upstream).toBe('https://github.com/midnightntwrk/servicedesk/issues/216');
    expect(result.reportedSkip).toEqual(REPORTED_PREPROD_EVENT_SKIP);
  });

  it('treats a cross-indexer resume as non-portable even when ids look contiguous', () => {
    const result = classifyEventIdSequence({
      eventIds: [10, 11, 12],
      savedFromHost: 'indexer.preprod.midnight.network',
      resumeHost: 'preprod.blockfrost.io',
    });
    expect(result.classification).toBe('non-portable-resume');
    expect(result.ok).toBe(false);
    expect(result.hint).toMatch(/sync from genesis/);
  });

  it('does not invent a query when the sample is incomplete', () => {
    const result = classifyEventIdSequence({ eventIds: [1] });
    expect(result.classification).toBe('incomplete');
    expect(result.hint).toMatch(/does not call the indexer/);
  });

  it('accepts a contiguous same-indexer sample', () => {
    const result = classifyEventIdSequence({ eventIds: [4, 5, 6] });
    expect(result.ok).toBe(true);
    expect(result.classification).toBe('contiguous');
  });


  it('names the official non-linear dust insert as a non-portable cursor', () => {
    const result = decodeDustTreeInsert(
      'Wallet.Other: Error while applying sync update\n[cause]: Error: values inserted non-linearly into dust generation tree; expected to insert index 399177, but received 399179.',
    );
    expect(result.ok).toBe(false);
    expect(result.classification).toBe('non-portable-dust-cursor');
    expect(result.expected).toBe(399177);
    expect(result.received).toBe(399179);
    expect(result.hint).toMatch(/sync from genesis/);
    expect(result.hint).toMatch(/servicedesk#216/);
    expect(result.hint).toMatch(/Not a public indexer or node fix/);
    expect(result.docs).toBe('https://docs.midnight.network/guides/networks-and-environments');
  });

  it('does not classify an unrelated prove error as a cursor mismatch', () => {
    const result = decodeDustTreeInsert('proof server unreachable on port 6300');
    expect(result.ok).toBe(true);
    expect(result.classification).toBe('not-dust-tree-insert');
  });

  it('keeps the lab credit block', () => {
    expect(eventIdGapCredit).toContain('Email: kshot9000@gmail.com');
    expect(eventIdGapCredit).toContain('Built by @kshot9000 https://x.com/kshot9000');
  });
});
