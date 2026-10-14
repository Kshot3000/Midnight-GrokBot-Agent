/**
 * Classifies a bare /api faucet crash symptom.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/193
 * Does not contact any faucet or invent APIs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function classifyFaucetPath(path) {
  if (typeof path !== 'string') {
    return { kind: 'unknown', reason: 'missing path' };
  }
  const bare = path === '/api' || path === '/api/';
  if (bare) {
    return {
      kind: 'bare-api-crash-risk',
      reason: 'path matches router mount with no further segment; regex match can be null',
      upstream: 'midnightntwrk/servicedesk#193',
    };
  }
  return { kind: 'ordinary', reason: 'path has a segment or is not the mount' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = classifyFaucetPath('/api');
  console.log(JSON.stringify(result, null, 2));
  if (result.kind !== 'bare-api-crash-risk') process.exit(1);
  console.log('self-check ok');
}
