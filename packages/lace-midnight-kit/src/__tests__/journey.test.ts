import { describe, expect, it } from 'vitest';
import {
  advanceConnectJourney,
  createConnectJourney,
  journeyStepIndex,
} from '../connectJourney.js';

describe('connectJourney', () => {
  it('advances phases and tracks timestamps', () => {
    let s = createConnectJourney('idle');
    expect(s.phase).toBe('idle');
    s = advanceConnectJourney(s, 'discovering');
    expect(s.phase).toBe('discovering');
    s = advanceConnectJourney(s, 'awaiting_wallet');
    expect(s.startedAt).toBeTruthy();
    expect(journeyStepIndex('connected')).toBeGreaterThan(0);
    expect(journeyStepIndex('error')).toBe(-1);
  });
});
