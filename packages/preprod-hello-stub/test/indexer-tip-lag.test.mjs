import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HEIGHT_QUERY,
  REPORTED,
  classifyIndexerTipLag,
  heightFromIndexerBody,
} from '../src/indexer-tip-lag.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

test('documented block.height body parses', () => {
  assert.equal(HEIGHT_QUERY, '{ block { height } }');
  assert.equal(heightFromIndexerBody({ data: { block: { height: 2825871 } } }), 2825871);
  assert.equal(heightFromIndexerBody({ data: { block: { height: '2797947' } } }), 2797947);
  assert.equal(heightFromIndexerBody({ errors: [{ message: 'no' }] }), null);
});

test('servicedesk#230 heights classify as a third-party stall', () => {
  const result = classifyIndexerTipLag({
    publicTip: REPORTED.publicTip,
    thirdPartyTip: REPORTED.thirdPartyTip,
    txBlock: REPORTED.txBlock,
    stalledHours: REPORTED.stalledHours,
    thirdPartyHost: REPORTED.thirdPartyHost,
  });
  assert.equal(result.classification, 'third-party-indexer-behind-public-tip');
  assert.equal(result.lagBlocks, 27924);
  assert.equal(result.txAboveThirdParty, true);
  assert.equal(result.matchesReport, true);
  assert.match(result.upstream, /servicedesk\/issues\/230/);
  assert.match(result.claim, /not an indexer or node fix/);
  assert.match(result.credit, /kshot9000@gmail.com/);
});

test('a tip at or above the public tip is not the stall', () => {
  const result = classifyIndexerTipLag({ publicTip: 100, thirdPartyTip: 100, txBlock: 90 });
  assert.equal(result.classification, 'third-party-tip-not-behind');
});

test('missing heights stay incomplete', () => {
  const result = classifyIndexerTipLag({});
  assert.equal(result.classification, 'incomplete');
  assert.match(result.hint, /block \{ height \}/);
});
