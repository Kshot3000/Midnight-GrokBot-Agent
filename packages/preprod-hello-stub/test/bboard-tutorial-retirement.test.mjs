/**
 * Tests for bulletin-board tutorial retirement classifier.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1577
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RETIRED_PATHS,
  classifyBboardTutorialPath,
  classifyBboardSource,
  BBOARD_ASSERTS,
} from '../src/bboard-tutorial-retirement.mjs';

test('six planned-retired paths map to /tutorials', () => {
  for (const path of RETIRED_PATHS) {
    const result = classifyBboardTutorialPath(`https://docs.midnight.network${path}`);
    assert.equal(result.ok, false);
    assert.equal(result.kind, 'planned-retired');
    assert.equal(result.redirectTo, '/tutorials');
    assert.equal(result.stillLive, true);
  }
});

test('tutorials landing is the target', () => {
  const result = classifyBboardTutorialPath('/tutorials');
  assert.equal(result.ok, true);
  assert.equal(result.kind, 'landing');
});

test('example repo and create-mn-app template stay valid', () => {
  const repo = classifyBboardSource('https://github.com/midnightntwrk/example-bboard');
  assert.equal(repo.ok, true);
  assert.equal(repo.kind, 'example-repo');
  const template = classifyBboardSource('npx create-mn-app --template bboard');
  assert.equal(template.ok, true);
  assert.equal(template.kind, 'create-mn-app-template');
});

test('docs tutorial path is not a valid long-term source', () => {
  const result = classifyBboardSource('https://docs.midnight.network/examples/dapps/bboard');
  assert.equal(result.ok, false);
  assert.equal(result.kind, 'docs-tutorial');
});

test('contract asserts are the published three, not invented', () => {
  assert.deepEqual(BBOARD_ASSERTS, [
    'Attempted to post to an occupied board',
    'Attempted to take down post from an empty board',
    'Attempted to take down post, but not the current owner',
  ]);
});
