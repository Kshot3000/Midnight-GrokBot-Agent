import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyIndexerUsability, TUTORIAL_IMAGE, LOCAL_NETWORK_IMAGE } from '../src/indexer-usability-gap.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const v4 = 'query { contractAction(address: "3031323") { __typename ... on ContractCall { address state zswapState } } }';

test('v4 local shape still records the missing operator guide', () => {
  const result = classifyIndexerUsability({
    httpUrl: 'http://127.0.0.1:8088/api/v4/graphql',
    wsUrl: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
    image: TUTORIAL_IMAGE,
    query: v4,
  });
  assert.equal(result.kind, 'local-v4-no-operator-guide');
  assert.equal(result.operatorGuideMissing, true);
  assert.equal(result.publicIndexerFixed, false);
  assert.match(result.upstream, /midnight-docs\/issues\/285/);
  assert.match(result.reasons.join(' '), /285/);
});

test('chainState without zswapState is the older reference, not v4', () => {
  const result = classifyIndexerUsability({
    httpUrl: 'http://localhost:8088/api/v4/graphql',
    wsUrl: 'ws://localhost:8088/api/v4/graphql/ws',
    image: LOCAL_NETWORK_IMAGE,
    query: 'query { contractAction(address: "aa") { address chainState } }',
  });
  assert.equal(result.kind, 'stale-v1-query');
  assert.equal(result.usesV1, true);
  assert.match(result.warnings.join(' '), /chainState/);
  assert.match(result.warnings.join(' '), /4\.0\.1/);
});

test('a hosted preprod path is not treated as the local recipe', () => {
  const result = classifyIndexerUsability({
    httpUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    query: v4,
  });
  assert.equal(result.httpOk, false);
  assert.equal(result.publicIndexerFixed, false);
  assert.match(result.warnings.join(' '), /8088/);
});
