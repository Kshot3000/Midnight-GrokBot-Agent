/**
 * Classifies a silent DUST subscription symptom.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/251
 * Does not contact any indexer or invent APIs.
 * Matches the reported shape: appliedIndex behind highestRelevantWalletIndex,
 * isConnected stays true, and no events arrive for a silence window.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export function classifyDustProgress(progress, silenceSeconds = 0) {
  if (!progress || typeof progress.appliedIndex === 'undefined') {
    return { kind: 'unknown', reason: 'missing progress' };
  }
  const applied = BigInt(progress.appliedIndex);
  const highest = BigInt(progress.highestRelevantWalletIndex ?? 0);
  const behind = applied < highest;
  const isConnected = progress.isConnected === true;
  const silenceLong = Number(silenceSeconds) >= 60;

  if (isConnected && behind && silenceLong) {
    return {
      kind: 'silent-open-subscription',
      reason: 'isConnected true while appliedIndex did not advance for at least 60s',
      applied: applied.toString(),
      highest: highest.toString(),
      silenceSeconds,
      upstream: 'midnightntwrk/servicedesk#251',
    };
  }
  if (!isConnected) {
    return { kind: 'disconnected', reason: 'isConnected false' };
  }
  if (!behind) {
    return { kind: 'caught-up', reason: 'appliedIndex >= highestRelevantWalletIndex' };
  }
  return {
    kind: 'progressing-or-short',
    reason: 'behind but silence under threshold or still receiving',
    silenceSeconds,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const samples = [
    {
      progress: { appliedIndex: 5890, highestRelevantWalletIndex: 1654335, isConnected: true },
      silence: 300,
      expect: 'silent-open-subscription',
    },
    {
      progress: { appliedIndex: 1654335, highestRelevantWalletIndex: 1654335, isConnected: true },
      silence: 300,
      expect: 'caught-up',
    },
    {
      progress: { appliedIndex: 5890, highestRelevantWalletIndex: 1654335, isConnected: false },
      silence: 300,
      expect: 'disconnected',
    },
    {
      progress: { appliedIndex: 5890, highestRelevantWalletIndex: 1654335, isConnected: true },
      silence: 30,
      expect: 'progressing-or-short',
    },
  ];
  let failed = false;
  for (const s of samples) {
    const result = classifyDustProgress(s.progress, s.silence);
    console.log(JSON.stringify(result));
    if (result.kind !== s.expect) {
      console.error('expected', s.expect, 'got', result.kind);
      failed = true;
    }
  }
  if (failed) process.exit(1);
  console.log('self-check ok');
}
