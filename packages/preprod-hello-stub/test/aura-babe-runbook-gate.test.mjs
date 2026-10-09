import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { classifyRunbookNote, officialStillAura, UPSTREAM } from '../src/aura-babe-runbook-gate.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const official = 'AURA for block production and GRANDPA for finality. Sr25519 AURA authorship.';

describe('aura babe runbook gate', () => {
  it('reads the published excerpt as still AURA', () => {
    assert.equal(officialStillAura(official), true);
  });

  it('rejects a note that treats the node-repo runbook as public docs', () => {
    const result = classifyRunbookNote(
      'Follow the runbook on docs.midnight.network: generate BABE session keys and drop AURA keys.',
      { officialExcerpt: official },
    );
    assert.equal(result.ok, false);
    assert.equal(result.classification, 'runbook-not-public-docs');
    assert.equal(result.upstream, UPSTREAM);
    assert.equal(result.doesNotFixPublicNode, true);
  });

  it('accepts a note that keeps the issue blocked', () => {
    const result = classifyRunbookNote(
      'Public docs are not published for BABE. midnight-docs#1092 is blocked until mainnet migration. Stay on AURA / GRANDPA.',
      { officialExcerpt: official },
    );
    assert.equal(result.ok, true);
    assert.equal(result.classification, 'stays-on-published-aura');
    assert.equal(result.pins.midnightJs, '4.1.1');
    assert.equal(result.pins.proofServer, '8.1.0');
  });
});
