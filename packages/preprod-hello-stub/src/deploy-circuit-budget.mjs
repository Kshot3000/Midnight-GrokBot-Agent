/**
 * Count exported Compact circuits and flag a single-transaction deploy
 * that matches the heavy-deploy pattern in midnightntwrk/servicedesk#226.
 *
 * Does not call the Compact compiler, does not rewrite ContractDeploy, and
 * does not add a midnight-js option. Official docs say a 1010 with
 * BlockLimitExceededError (Custom error: 154) or FeeCalculation.BlockLimitExceeded
 * (232) means the transaction exceeds block resource limits, and the fix is
 * to split the work across transactions:
 * https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 *
 * The "about 15 exported circuits" line is the reporter's observation in
 * servicedesk#226, not a constant published by the node RPC. This helper
 * only uses that observation as a local warning threshold.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/226';
export const RELATED_SUBMISSION = 'https://github.com/midnightntwrk/servicedesk/issues/225';
export const DOCS = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';

/** Reporter observation in servicedesk#226, not an official node constant. */
export const HEAVY_EXPORT_OBSERVATION = 15;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

export function listExportedCircuits(source) {
  const text = stripComments(source);
  const names = [];
  const re = /\bexport\s+circuit\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  let match = re.exec(text);
  while (match) {
    names.push(match[1]);
    match = re.exec(text);
  }
  return names;
}

export function assessDeployCircuitBudget(source, options = {}) {
  const circuits = listExportedCircuits(source);
  const threshold = Number.isInteger(options.threshold) ? options.threshold : HEAVY_EXPORT_OBSERVATION;
  const heavy = circuits.length >= threshold;
  return {
    ok: !heavy,
    exportedCircuits: circuits,
    count: circuits.length,
    threshold,
    upstream: UPSTREAM,
    related: RELATED_SUBMISSION,
    docs: DOCS,
    title: heavy
      ? 'Single deployContract may exhaust the block limits'
      : 'Exported-circuit count is under the reported heavy-deploy observation',
    hint: heavy
      ? 'midnight-js 4.1.1 deployContract / createUnprovenDeployTx include every provable circuit. servicedesk#226 reports that about 15 exported circuits can push a deploy over the per-transaction share of the block bytesWritten limit, and the node reply can be RPC 1010 "Transaction would exhaust the block limits" (related #225). Official decode page: Custom error 154 is BlockLimitExceededError and 232 is FeeCalculation.BlockLimitExceeded; split the work across transactions. This lab does not invent a subset-deploy option and does not rewrite ContractDeploy.'
      : 'Count is below the servicedesk#226 observation. A later 1010 can still be a block-limit rejection; decode the node text instead of treating a generic "Transaction submission error" as a proof failure.',
  };
}
