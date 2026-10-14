/**
 * Classifies a silent DUST subscription symptom.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/251
 * Does not contact any indexer or invent APIs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function classifyDustProgress(progress, silenceSeconds = 0) {
  if (!progress || typeof progress.appliedIndex === 'undefined') {
    return { kind: 'unknown', reason: 'missing progress' };
  }
  const stuck = progress.appliedIndex === progress.highestRelevantWalletIndex
    ? false
    : progress.appliedIndex < progress.highestRelevantWalletIndex;
  const silentOpen = progress.isConnected === true && stuck && silenceSeconds >= 60;
  if (silentOpen) {
    return {
      kind: 'silent-open-subscription',
      reason: 'isConnected true while appliedIndex did not advance for at least 60s',
      upstream: 'midnightntwrk/servicedesk#251',
    };
  }
  if (progress.isConnected === false) {
    return { kind: 'disconnected', reason: 'isConnected false' };
  }
  if (!stuck) {
    return { kind: 'caught-up', reason: 'appliedIndex >= highestRelevantWalletIndex' };
  }
  return { kind: 'progressing-or-short', reason: 'behind but silence under threshold or still receiving' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = { appliedIndex: 5890, highestRelevantWalletIndex: 1654335, isConnected: true };
  const result = classifyDustProgress(sample, 300);
  console.log(JSON.stringify(result, null, 2));
  if (result.kind !== 'silent-open-subscription') process.exit(1);
  console.log('self-check ok');
}
