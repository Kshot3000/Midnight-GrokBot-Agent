/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkWalletSubmitLog, classifySubmitSample, OFFICIAL_SIGN_AND_SEND } from '../src/wallet-submit-log.mjs';

test('1010 how-to signAndSend sample is replaced by wallet.submitTransaction logging', () => {
  const result = checkWalletSubmitLog();
  assert.equal(result.ok, true, result.failures.join('; '));
  const decoded = classifySubmitSample(OFFICIAL_SIGN_AND_SEND);
  assert.equal(decoded.kind, 'replace-sign-and-send');
  assert.equal(decoded.usesMidnightSubmit, false);
  assert.match(decoded.replacement, /wallet\.submitTransaction\(tx\)/);
  assert.match(decoded.replacement, /String\(err\)/);
  assert.doesNotMatch(decoded.replacement, /signAndSend/);
});
