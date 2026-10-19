/**
 * Classify the mainnet deploy-pending-until-TTL symptom reported in servicedesk#257.
 * Does not contact any node, RPC, indexer, or proof server.
 * Does not invent APIs. Official deploy docs:
 *   https://docs.midnight.network/guides/deploy-and-operate
 *   https://docs.midnight.network/nodes/node-toolkit
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/257
 * Related: https://github.com/midnightntwrk/servicedesk/issues/34
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/257';
export const RELATED = 'https://github.com/midnightntwrk/servicedesk/issues/34';
export const OFFICIAL_DEPLOY = 'https://docs.midnight.network/guides/deploy-and-operate';
export const OFFICIAL_TOOLKIT = 'https://docs.midnight.network/nodes/node-toolkit';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string|object} input
 */
export function classifyDeployPendingTtl(input) {
  const text = typeof input === 'string'
    ? input
    : JSON.stringify(input ?? '');
  const flat = text.replace(/\s+/g, ' ').trim();

  if (!flat) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'no text to classify',
      hint: 'Pass pool / validate / apply notes. This helper does not contact a node.',
      upstream: UPSTREAM,
      docs: OFFICIAL_DEPLOY,
      credit: CREDIT,
    };
  }

  const hasPending = /pending|author_pendingExtrinsics|never included|TTL/i.test(flat);
  const hasValid = /validate_transaction|Valid|propagate true/i.test(flat);
  const hasApplyOk = /apply_extrinsic|Ok\(Ok\)|0x0000/i.test(flat);
  const hasCallsLand = /contract calls? (are |were )?included|calls land/i.test(flat);
  const mentionsFilter = /filter-deploy-txs|filter.deploy/i.test(flat);

  const matchesSymptom = hasPending && (hasValid || hasApplyOk);

  if (!matchesSymptom && !mentionsFilter) {
    return {
      ok: true,
      classification: 'not-deploy-pending',
      title: 'does not match the #257 deploy-pending pattern',
      hint: 'Look for a deploy that stays in the pool until TTL after a Valid validate or Ok apply, while calls are included. See servicedesk#257.',
      upstream: UPSTREAM,
      docs: OFFICIAL_DEPLOY,
      credit: CREDIT,
    };
  }

  return {
    ok: true,
    classification: 'deploy-pending-until-ttl',
    title: 'Valid deploy stayed pending until TTL while calls were included',
    hint:
      'servicedesk#257 reports mainnet contract-deploy txs accepted by public RPC pools, validated, and applied cleanly, yet never included before TTL. Calls in the same windows were included. The report asks whether producers or relays still run --filter-deploy-txs (which refuses deploys and lets calls through). This classifier does not fix the public node, indexer, or RPC. Prefer official local / Preprod deploy paths for tests. Related: servicedesk#34 and MIP #361.',
    signals: { hasPending, hasValid, hasApplyOk, hasCallsLand, mentionsFilter },
    upstream: UPSTREAM,
    related: RELATED,
    docs: OFFICIAL_DEPLOY,
    toolkit: OFFICIAL_TOOLKIT,
    claim: 'sample classification only — not a node or indexer fix',
    credit: CREDIT,
  };
}

export const deployPendingCredit = CREDIT;

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample =
    'author_pendingExtrinsics showed the deploy until TTL. validate_transaction returned Valid. apply_extrinsic Ok(Ok). contract calls were included. possible --filter-deploy-txs';
  const result = classifyDeployPendingTtl(sample);
  console.log(JSON.stringify(result, null, 2));
  if (result.classification !== 'deploy-pending-until-ttl') process.exit(1);
  console.log('self-check ok');
  console.log(CREDIT);
}
