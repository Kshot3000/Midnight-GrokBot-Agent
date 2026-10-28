/**
 * Classifies the faucet-server crash on bare /api from servicedesk#193.
 * Only restates the reported TypeError. Does not call the faucet, invent APIs, or claim a fix.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/193
 * Official: https://docs.midnight.network/guides/acquire-tokens
 * Official: https://docs.midnight.network/guides/networks-and-environments
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_FAUCET_BARE_API = 'https://github.com/midnightntwrk/servicedesk/issues/193';
export const OFFICIAL_ACQUIRE =
  'https://docs.midnight.network/guides/acquire-tokens';
export const OFFICIAL_NETWORKS =
  'https://docs.midnight.network/guides/networks-and-environments';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} symptom free-text log line
 */
export function classifyFaucetBareApiCrash(symptom) {
  const text = String(symptom ?? '').toLowerCase();
  const base = {
    upstream: UPSTREAM_FAUCET_BARE_API,
    official: OFFICIAL_ACQUIRE,
    credit: CREDIT,
  };

  if (
    text.includes('cannot read properties of null') &&
    text.includes('groups')
  ) {
    return {
      ...base,
      kind: 'faucet-bare-api-null-regex',
      cause:
        'Faucet request-timing middleware hit a null regex match on a bare /api path and crashed the process.',
      action:
        'Recognize the symptom from the TypeError. Wait for the faucet process to restart. This lab does not fix the public faucet.',
    };
  }

  return {
    ...base,
    kind: 'unknown',
    cause: 'Symptom does not match the documented bare /api faucet crash.',
    action: 'Check official faucet guides before inventing a workaround.',
  };
}

const isMain =
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMain || import.meta.url === `file://${process.argv[1]}`) {
  const hit = classifyFaucetBareApiCrash(
    "TypeError: Cannot read properties of null (reading 'groups')",
  );
  const miss = classifyFaucetBareApiCrash('rate_limit_error');
  const ok = hit.kind === 'faucet-bare-api-null-regex' && miss.kind === 'unknown';
  if (!ok) {
    console.error(JSON.stringify({ hit, miss }, null, 2));
    process.exit(1);
  }
  console.log(
    JSON.stringify(
      { ok: true, kind: hit.kind, upstream: UPSTREAM_FAUCET_BARE_API, credit: CREDIT },
      null,
      2,
    ),
  );
}
