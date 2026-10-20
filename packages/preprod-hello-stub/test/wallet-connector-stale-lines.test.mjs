import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyWalletConnectorSnippet } from '../src/wallet-connector-stale-lines.mjs';

test('flags payFees on submitTransaction', () => {
  const r = classifyWalletConnectorSnippet('await api.submitTransaction(tx, { payFees: false })');
  assert.equal(r.ok, false);
  assert.ok(r.findings.some((f) => f.kind === 'payfees-on-submit'));
  assert.match(r.upstream, /1569/);
});

test('flags capitalized PreProd', () => {
  const r = classifyWalletConnectorSnippet("w.connect('PreProd')");
  assert.ok(r.findings.some((f) => f.kind === 'capitalized-network-id'));
});

test('flags selectWallet without apiVersion', () => {
  const r = classifyWalletConnectorSnippet('function selectWallet(wallets) { return wallets[0]; }');
  assert.ok(r.findings.some((f) => f.kind === 'missing-api-version'));
});

test('clean snippet is ok', () => {
  const r = classifyWalletConnectorSnippet('await api.submitTransaction(tx)');
  assert.equal(r.ok, true);
  assert.equal(r.findings.length, 0);
});
