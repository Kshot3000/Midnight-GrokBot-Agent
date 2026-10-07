import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CUTOFF,
  HOSTED,
  classifyPreprodUrl,
  decodePreprodEndpointError,
} from '../src/preprod-blockfrost-cutoff.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

test('official hosted Preprod URLs stay classified as hosted', () => {
  const where = classifyPreprodUrl(HOSTED.indexer);
  assert.equal(where.hosted, true);
  assert.equal(where.blockfrost, false);
  assert.equal(where.oldIndexerPath, true);
  assert.equal(CUTOFF.utc, '2026-10-09T22:00:00Z');
});

test('ENOTFOUND on the hosted indexer matches the scheduled shutdown shape', () => {
  const result = decodePreprodEndpointError({
    url: HOSTED.indexer,
    error: { code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND indexer.preprod.midnight.network' },
  });
  assert.equal(result.classification, 'hosted-preprod-hostname-unresolved');
  assert.match(result.upstream, /midnight-docs\/issues\/1504/);
  assert.match(result.claim, /not an indexer or node fix/);
  assert.match(result.credit, /kshot9000@gmail.com/);
});

test('Blockfrost 403 texts from the mainnet migration table decode', () => {
  const missing = decodePreprodEndpointError({
    url: 'https://midnight-preprod.blockfrost.io/api/v0',
    status: 403,
    body: 'Missing project token. Please include project_id in your request.',
  });
  assert.equal(missing.classification, 'blockfrost-missing-project-token');

  const mismatch = decodePreprodEndpointError({
    url: 'https://rpc.midnight-preprod.blockfrost.io',
    status: 403,
    body: 'Network token mismatch. Are you using token for the correct network?',
  });
  assert.equal(mismatch.classification, 'blockfrost-network-token-mismatch');
});

test('a Blockfrost host with the old indexer path is flagged', () => {
  const result = decodePreprodEndpointError({
    url: 'https://midnight-preprod.blockfrost.io/api/v4/graphql',
  });
  assert.equal(result.classification, 'blockfrost-old-indexer-path');
});

test('an unrelated error stays unclassified', () => {
  const result = decodePreprodEndpointError({ url: 'http://127.0.0.1:6300/health', status: 500 });
  assert.equal(result.classification, 'unclassified');
});
