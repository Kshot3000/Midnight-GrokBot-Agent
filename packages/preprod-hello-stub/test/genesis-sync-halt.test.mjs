import { describe, expect, it } from 'vitest';
import {
  AFFECTED_NODE,
  classifyGenesisSyncHalt,
  HALT_HEIGHT,
  NEXT_BLOCK,
} from '../src/genesis-sync-halt.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const HALT_LOG = [
  'Transaction malformed: transaction application error detected during verification: Intent TTL has expired. TTL: Timestamp(1784643562), Current block: Timestamp(1784643564)',
  'Transaction(3) failed due to Invalid(Custom(182)). Aborting the rest of the block execution.',
  'halted at #1788979',
].join('\n');

describe('genesis sync halt', () => {
  it('names the 1.0.300 halt without claiming a node fix', () => {
    const result = classifyGenesisSyncHalt({ log: HALT_LOG, nodeVersion: AFFECTED_NODE });
    expect(result.classification).toBe('genesis-sync-halt');
    expect(result.haltHeight).toBe(HALT_HEIGHT);
    expect(result.nextBlock).toBe(NEXT_BLOCK);
    expect(result.upstream).toContain('servicedesk/issues/235');
    expect(result.docs).toContain('docs.midnight.network/relnotes/node');
    expect(result.hint).toMatch(/not a node or indexer fix/i);
    expect(result.hint).toMatch(/1\.0\.400/);
  });

  it('treats public endpoint callers as unaffected', () => {
    const result = classifyGenesisSyncHalt({ log: HALT_LOG, audience: 'public' });
    expect(result.classification).toBe('public-endpoints-unaffected');
    expect(result.ok).toBe(true);
  });

  it('does not match an unrelated submission error', () => {
    const result = classifyGenesisSyncHalt({ log: 'Transaction submission error' });
    expect(result.classification).toBe('unrelated');
    expect(result.ok).toBe(false);
  });
});
