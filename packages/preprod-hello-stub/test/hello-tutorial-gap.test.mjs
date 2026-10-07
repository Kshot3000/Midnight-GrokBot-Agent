/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkHelloTutorialGap, checkLabHelloTutorialGap } from '../src/hello-tutorial-gap.mjs';

test('lab hello-tutorial-gap matches the published storeMessage sample', () => {
  const result = checkLabHelloTutorialGap();
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.upstream, 'midnightntwrk/midnight-docs#1396');
  assert.ok(result.missingFromTutorial.includes('witness'));
});

test('rejects a tutorial copy that invents a witness or getter', () => {
  const result = checkHelloTutorialGap(`
    pragma language_version 0.23;
    export ledger message: Opaque<"string">;
    witness localNote(): Bytes<32>;
    export circuit storeMessage(newMessage: Opaque<"string">): [] {
      message = disclose(newMessage);
    }
    export circuit readMessage(): Opaque<"string"> { return message; }
  `);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((item) => item.includes('witness')));
  assert.ok(result.failures.some((item) => item.includes('read circuit')));
});
