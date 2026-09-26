import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONNECT_JOURNEY_STEPS,
  advanceConnectJourney,
  createConnectJourney,
  journeyStepIndex,
} from '../dist/connectJourney.js';

describe('connectJourney', () => {
  it('starts idle', () => {
    const j = createConnectJourney();
    assert.equal(j.phase, 'idle');
    assert.ok(j.updatedAt);
  });
  it('advances phases and indexes', () => {
    let j = createConnectJourney('idle');
    j = advanceConnectJourney(j, 'discovering');
    assert.equal(j.phase, 'discovering');
    assert.equal(journeyStepIndex('discovering'), 1);
    assert.equal(journeyStepIndex('connected'), CONNECT_JOURNEY_STEPS.length - 1);
    assert.equal(journeyStepIndex('error'), -1);
  });
  it('records startedAt on awaiting_wallet', () => {
    let j = createConnectJourney('ready_to_connect');
    assert.equal(j.startedAt, null);
    j = advanceConnectJourney(j, 'awaiting_wallet', 'Approve in Lace');
    assert.ok(j.startedAt);
    assert.match(j.detail, /Approve/);
  });
});
