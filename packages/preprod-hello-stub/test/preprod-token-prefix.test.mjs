import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PREFIX,
  PREPROD_FAUCET,
  classifyProjectPrefix,
  redactProjectId,
} from '../src/preprod-token-prefix.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

test('redaction keeps only the documented prefix', () => {
  const sample = `${PREFIX.preprod}ExampleNotARealToken`;
  const redacted = redactProjectId(sample);
  assert.equal(redacted.prefix, 'nightpreprod');
  assert.equal(redacted.redacted, 'nightpreprod…');
  assert.equal(redacted.redacted.includes('Example'), false);
});

test('a preprod prefix matches a preprod target and does not claim a node fix', () => {
  const result = classifyProjectPrefix(`${PREFIX.preprod}ExampleNotARealToken`, 'preprod');
  assert.equal(result.classification, 'prefix-matches-target');
  assert.equal(result.ok, true);
  assert.match(result.upstream, /midnight-docs\/issues\/1504/);
  assert.match(result.claim, /not an indexer or node fix/);
  assert.equal(result.faucet, PREPROD_FAUCET);
  assert.match(result.credit, /kshot9000@gmail.com/);
});

test('a mainnet prefix on a preprod target is a mismatch', () => {
  const result = classifyProjectPrefix(`${PREFIX.mainnet}ExampleNotARealToken`, 'preprod');
  assert.equal(result.classification, 'network-token-prefix-mismatch');
  assert.equal(result.ok, false);
  assert.match(result.hint, /nightpreprod/);
});

test('an empty id stays unrecognized', () => {
  const result = classifyProjectPrefix('', 'preprod');
  assert.equal(result.classification, 'unrecognized-project-prefix');
});
