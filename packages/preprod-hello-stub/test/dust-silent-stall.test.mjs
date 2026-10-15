import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyDustSilentStall } from '../src/dust-silent-stall-decode.mjs';

test('detects isConnected true with stalled appliedIndex',
  () => {
    const r = classifyDustSilentStall('isConnected=true appliedIndex stayed at 5890');
    assert.equal(r.ok, true);
    assert.equal(r.kind, 'silent-subscription');
    assert.match(r.hint, /servicedesk#251/i);
  });

test('detects quiet stream wording',
  () => {
    const r = classifyDustSilentStall('dustLedgerEvents stops delivering events while the socket stays open');
    assert.equal(r.ok, true);
    assert.equal(r.kind, 'quiet-stream');
  });

test('ignores disconnected progress',
  () => {
    const r = classifyDustSilentStall('isConnected=false');
    assert.equal(r.ok, false);
  });
