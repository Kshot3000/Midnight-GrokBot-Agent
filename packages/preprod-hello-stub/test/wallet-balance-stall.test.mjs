import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyWalletBalanceStall,
  builderCredit,
  WALLET_BALANCE_STALL_DOCS,
} from '../src/wallet-balance-stall.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('classifyWalletBalanceStall', () => {
  it('names the enter marker as a pre-submit hang', () => {
    const decoded = classifyWalletBalanceStall(
      'proof generation completed; last marker wallet-balance/finalization-enter; submission never reached',
    );
    assert.equal(decoded.kind, 'balance-finalization-enter');
    assert.match(decoded.hint, /submitTransaction was not called/);
    assert.equal(decoded.upstream, WALLET_BALANCE_STALL_DOCS.upstream);
    assert.equal(decoded.docs, WALLET_BALANCE_STALL_DOCS.walletGuide);
  });

  it('keeps a 1010 rejection in the submit class', () => {
    const decoded = classifyWalletBalanceStall(
      'Transaction submission error: 1010 Invalid Transaction: Transaction would exhaust the block limits',
    );
    assert.equal(decoded.kind, 'reached-submit');
    assert.match(decoded.hint, /not that hang/);
  });

  it('does not treat an indexer 503 as the wallet hang', () => {
    const decoded = classifyWalletBalanceStall('preprod indexer returned HTTP 503');
    assert.equal(decoded.kind, 'not-a-wallet-balance-stall');
    assert.match(decoded.hint, /does not claim an indexer or node fix/);
  });

  it('maps a non-returning balance call without inventing an RSS sampler', () => {
    const decoded = classifyWalletBalanceStall(
      'balanceFinalizedTransaction does not return; process is CPU-bound; watchdog timeout',
    );
    assert.equal(decoded.kind, 'balance-call-did-not-return');
    assert.match(decoded.hint, /does not sample RSS/);
  });

  it('keeps the published call names and the credit block', () => {
    assert.ok(WALLET_BALANCE_STALL_DOCS.publishedCalls.includes('finalizeRecipe'));
    assert.equal(WALLET_BALANCE_STALL_DOCS.enterMarker, 'wallet-balance/finalization-enter');
    assert.match(builderCredit, /Email: kshot9000@gmail.com/);
    assert.match(builderCredit, /addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v/);
  });
});
