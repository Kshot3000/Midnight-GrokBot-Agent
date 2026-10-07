import assert from 'node:assert/strict';
import test from 'node:test';
import { scanOwnPublicKeyAuth } from '../src/own-pubkey-auth-scan.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const UNSAFE = `
export circuit withdraw(): [] {
  assert(ownPublicKey().bytes == owner, "not owner");
}
`;

const SAFE = `
witness secretKey(): Bytes<32>;
circuit derivePublicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "myapp:owner"), sk]);
}
export circuit withdraw(): [] {
  assert(derivePublicKey(secretKey()) == owner, "not owner");
}
// assert(ownPublicKey().bytes == owner) is the bypassable form
`;

test('flags ownPublicKey equality used as caller auth', () => {
  const result = scanOwnPublicKeyAuth(UNSAFE);
  assert.equal(result.ok, false);
  assert.equal(result.classification, 'ownPublicKey-as-caller-auth');
  assert.equal(result.hits.length, 1);
  assert.match(result.upstream, /midnight-docs\/issues\/902/);
  assert.match(result.credit, /kshot9000@gmail.com/);
});

test('ignores the unsafe form when it is only a comment', () => {
  const result = scanOwnPublicKeyAuth(SAFE);
  assert.equal(result.ok, true);
  assert.equal(result.usesDerivedIdentity, true);
});
