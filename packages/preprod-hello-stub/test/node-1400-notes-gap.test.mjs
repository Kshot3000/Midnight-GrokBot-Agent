/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyNode1400NotesGap, MISSING_NOTES, PUBLISHED_TAG } from '../src/node-1400-notes-gap.mjs';

test('official index still latest 1.0.300 while the 1.0.400 tag exists', () => {
  const result = classifyNode1400NotesGap({
    documentedLatest: '1.0.300',
    notesPageFor1400: false,
    releasePublished: true,
    plansFixIn1400: true,
  });
  assert.equal(result.ok, true);
  assert.equal(result.classification, 'docs-behind-published-tag');
  assert.equal(result.publishedTag, PUBLISHED_TAG);
  assert.equal(result.missing, MISSING_NOTES);
  assert.match(result.claim, /not a node or indexer fix/);
});

test('does not treat a future docs page as already shipped', () => {
  const result = classifyNode1400NotesGap({
    documentedLatest: '1.0.400',
    notesPageFor1400: true,
    releasePublished: true,
    plansFixIn1400: false,
  });
  assert.equal(result.classification, 'aligned');
  assert.match(result.hint, /not a node or indexer fix/);
});

test('rejects an invented latest version', () => {
  const result = classifyNode1400NotesGap({ documentedLatest: 'latest' });
  assert.equal(result.ok, false);
  assert.equal(result.classification, 'incomplete');
});
