/**
 * Classify a pasted deploy error that mentions bytesWritten or verifier-key size.
 * Official: https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/deployContract
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/226
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_SUBSET_DEPLOY = 'https://github.com/midnightntwrk/servicedesk/issues/226';
export const OFFICIAL_DEPLOY = 'https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/deployContract';

export function decodeSubsetDeploy(message) {
  const text = String(message || '');
  const mentionsBytes = /bytesWritten|bytes.?written/i.test(text);
  const mentionsVk = /verifier.?key|vk.?size|MaintenanceUpdate/i.test(text);
  const isGap = mentionsBytes || mentionsVk;
  return {
    isSubsetDeployGap: isGap,
    mentionsBytesWritten: mentionsBytes,
    mentionsVerifierKey: mentionsVk,
    upstream: UPSTREAM_SUBSET_DEPLOY,
    official: OFFICIAL_DEPLOY,
    note: isGap
      ? 'deployContract includes every circuit verifier key; see upstream for the bytesWritten limit and single-key insert path. This lab does not invent a subset API.'
      : 'not classified as the subset-deploy / bytesWritten gap',
  };
}
