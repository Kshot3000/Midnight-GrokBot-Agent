import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeProvePathError } from '../src/prove-path-error-decode.mjs';

test('dropped body on 400', () => {
  const err = new Error('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"');
  const d = decodeProvePathError(err);
  assert.equal(d.kind, 'dropped-body');
  assert.ok(d.notes.length > 0);
  assert.match(d.upstream, /243/);
});

test('timeout as abort', () => {
  const err = Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' });
  const d = decodeProvePathError(err);
  assert.equal(d.kind, 'timeout-as-abort');
});

test('official 429 job queue full', () => {
  const err = new Error('Failed Proof Server response: url="http://127.0.0.1:6300/prove", code="429", status="Too Many Requests"');
  const d = decodeProvePathError(err);
  assert.equal(d.kind, 'job-queue-full');
  assert.ok(d.notes.some((n) => /JobQueueFull/i.test(n)));
});
