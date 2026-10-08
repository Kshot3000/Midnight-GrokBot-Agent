/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSubmitVerifyPath, classifySubmitVerifyPath } from '../src/submit-verify-path.mjs';

test('how-to verify curl is not the Midnight submit path', () => {
  const result = checkSubmitVerifyPath();
  assert.equal(result.ok, true, result.failures.join('; '));
  const decoded = classifySubmitVerifyPath('method":"author_submitExtrinsic"');
  assert.equal(decoded.kind, 'docs-gap-author-submit-extrinsic');
  assert.equal(decoded.usesAuthorSubmit, true);
  assert.equal(decoded.upstream.includes('midnight-docs/issues/1509'), true);
});
