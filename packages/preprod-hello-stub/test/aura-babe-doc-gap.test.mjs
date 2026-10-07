import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { classifyAuraBabeNote, classifyConsensusDoc } from '../src/aura-babe-doc-gap.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const official = `
Midnight uses AURA for block production and GRANDPA for finality.
Sr25519: AURA block authorship signing.
`;

describe('aura babe doc gap', () => {
  it('reads the published pages as still AURA', () => {
    assert.equal(classifyConsensusDoc(official).officialStillAura, true);
  });

  it('flags a note that tells operators to mint BABE session keys now', () => {
    const result = classifyAuraBabeNote(
      'Generate BABE session keys and drop AURA keys before the next session.',
      official,
    );
    assert.equal(result.ok, false);
    assert.match(result.failures[0], /AURA/);
    assert.match(result.upstream, /midnight-docs\/issues\/1092/);
    assert.equal(result.doesNotFixPublicNode, true);
  });

  it('accepts a note that stays on the published AURA description', () => {
    const result = classifyAuraBabeNote(
      'Follow the nodes page: Sr25519 AURA authorship, GRANDPA finality. BABE docs are tracked in midnight-docs#1092 and are not published.',
      official,
    );
    assert.equal(result.ok, true);
    assert.equal(result.assumesBabeCurrent, false);
  });
});
