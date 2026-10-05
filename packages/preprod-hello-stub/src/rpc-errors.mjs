/**
 * Decode Midnight node / indexer failures that otherwise look like
 * a generic "Transaction submission error".
 *
 * Does not invent RPC methods. Maps strings already returned by the
 * public Preprod node and indexer. Upstream: midnightntwrk/servicedesk#225
 * (RPC 1010 block-limit), #230 (Preprod indexer stall),
 * midnight-docs#1385 (code 10999 missing from error tables).
 * LOCAL-TRUE helper. Not a node fix.
 * Credit: @kshot9000 https://x.com/kshot9000
 * Donate ADA: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function collectErrorText(err, depth = 0, seen = new Set()) {
  if (err == null || depth > 6) return '';
  if (typeof err === 'string' || typeof err === 'number') return String(err);
  if (typeof err !== 'object') return '';
  if (seen.has(err)) return '';
  seen.add(err);
  const parts = [];
  const keys = [
    ...Object.getOwnPropertyNames(err),
    ...Object.getOwnPropertySymbols(err).map((sym) => sym),
  ];
  for (const key of ['message', 'data', 'reason', 'name', '_tag', 'cause']) {
    if (err[key] != null) parts.push(collectErrorText(err[key], depth + 1, seen));
  }
  for (const key of keys) {
    if (['message', 'data', 'reason', 'name', '_tag', 'cause', 'stack'].includes(key)) continue;
    const value = err[key];
    if (value == null || typeof value === 'function') continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'object') {
      parts.push(collectErrorText(value, depth + 1, seen));
    }
  }
  return parts.filter(Boolean).join(' ');
}


/** Documented LedgerApiError u8 codes. Source: https://docs.midnight.network/nodes/error-codes */
export const LEDGER_CUSTOM_ERRORS = {
  103: { name: 'Zswap', hint: 'Zswap-level rejection (double-spend or unknown Merkle root). Check nullifier reuse and that the coin tree root is current. https://docs.midnight.network/nodes/error-codes' },
  106: { name: 'VerifierKeyNotFound', hint: 'Verifier key missing for the circuit operation. Deploy the verifier key before calling the circuit.' },
  111: { name: 'TransactionTooLarge', hint: 'Transaction exceeds maximum allowed size. Reduce the payload or split the transaction.' },
  115: { name: 'InvalidProof', hint: 'Zero-knowledge proof verification failed. Regenerate the proof with a compatible proof server (lab pin 8.1.0).' },
  126: { name: 'Unbalanced', hint: 'Negative balance in a token type. The transaction does not balance.' },
  154: { name: 'BlockLimitExceededError', hint: 'Transaction exceeds block limits. Reduce size or wait for a less full block. Related to a heavy deploy, not a proof-server crash.' },
  155: { name: 'FeeCalculationError', hint: 'Fee calculation failed. Official how-to: refresh fee estimates and confirm runtime packages match the support matrix. https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors' },
  166: { name: 'InvalidNetworkId', hint: 'Transaction network ID does not match the node. Check setNetworkId() against the target (Preprod vs undeployed).' },
  174: { name: 'MalformedContractDeploy', hint: 'Contract deployment is structurally invalid. Check non-zero balance or charged state in the deploy.' },
  179: { name: 'UnsupportedProofVersion', hint: 'Proof version not supported. Align the proof server and SDK (lab pins: proof-server 8.1.0, midnight-js 4.1.1).' },
  196: { name: 'DustDoubleSpend', hint: 'Attempt to spend the same DUST twice. Resync DUST wallet state. Official docs use Custom error: 196 as the example.' },
  231: { name: 'FeeCalculation.OutsideTimeToDismiss', hint: 'Documented malformed-transaction variant. Contract unshielded-token ops have been rejected with FeeCalculation(OutsideTimeToDismiss). Not a proof-server crash. https://github.com/midnightntwrk/servicedesk/issues/117' },
};

export function lookupLedgerCustomError(code) {
  const n = Number(code);
  if (!Number.isInteger(n) || n < 0 || n > 255) return null;
  return LEDGER_CUSTOM_ERRORS[n] || null;
}

function extractCustomErrorCode(text) {
  const match = String(text).match(/Custom error:\s*(\d+)/i);
  if (!match) return null;
  return Number(match[1]);
}

/** Five-digit submission codes are not LedgerApiError u8 values. */
function extractSubmissionLayerCode(text) {
  const match = String(text).match(/\(code:\s*(\d{4,})\)|\bcode:\s*(\d{4,})\b/i);
  if (!match) return null;
  return Number(match[1] || match[2]);
}

export function decodeMidnightRpcError(err) {
  const raw = collectErrorText(err) || (typeof err === 'string' ? err : err?.message || String(err ?? ''));
  const text = raw.replace(/\s+/g, ' ').trim();
  const code = /1010/.test(text) ? 1010 : null;

  const submissionLayer = extractSubmissionLayerCode(text);
  if (submissionLayer != null && submissionLayer > 255) {
    return {
      code: submissionLayer,
      ledgerCode: null,
      title: `Submission-layer code ${submissionLayer} is not a ledger u8`,
      hint: 'Official node tables are LedgerApiError u8 values (0-255), and the how-to page treats 1010 as the Substrate envelope. A five-digit code such as 10999 is not in those tables. Do not look it up as Custom error: N, and do not invent a variant name. Upstream docs gap: https://github.com/midnightntwrk/midnight-docs/issues/1385',
      upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1385',
      docs: 'https://docs.midnight.network/nodes/error-codes',
      raw: text,
    };
  }
  const custom = extractCustomErrorCode(text);
  if (custom != null) {
    const known = lookupLedgerCustomError(custom);
    const overRange = custom > 255;
    return {
      code: 1010,
      ledgerCode: overRange ? null : custom,
      title: known
        ? `Ledger ${known.name} (Custom error: ${custom})`
        : overRange
          ? `Custom error: ${custom} is not a ledger u8`
          : `Ledger custom error ${custom}`,
      hint: known
        ? known.hint
        : overRange
          ? 'Node ledger codes are u8 (0-255). A larger number did not come from the node error tables. Look for Custom error: N elsewhere in the chain.'
          : 'RPC 1010 carried Custom error: N. Look up N in the official node error tables. This lab does not invent a name for codes it has not copied from that page.',
      upstream: 'https://github.com/midnightntwrk/servicedesk/issues/225',
      docs: 'https://docs.midnight.network/nodes/error-codes',
      raw: text,
    };
  }
  if (code === 1010 || /exhaust the block limits/i.test(text)) {
    return {
      code: 1010,
      title: 'Transaction would exhaust the block limits',
      hint: 'The node rejected the tx before it was a proof or balance failure. Shrink the call, drop extra contract maintenance, or retry when the block is less full. Official node text is RPC 1010. A Substrate check can omit Custom error: N; ledger code 154 is the documented BlockLimitExceededError when the inner u8 is present.',
      upstream: 'https://github.com/midnightntwrk/servicedesk/issues/225',
      docs: 'https://docs.midnight.network/nodes/error-codes',
      raw: text,
    };
  }
  if (/indexer/i.test(text) && /(stall|behind|timeout|unavailable|ECONN)/i.test(text)) {
    return {
      code: null,
      title: 'Preprod indexer not following the node',
      hint: 'Public Preprod indexer has stalled tens of thousands of blocks behind the node. A failed sync is not proof the contract is wrong. Compare node head and indexer height before retrying.',
      upstream: 'https://github.com/midnightntwrk/servicedesk/issues/230',
      raw: text,
    };
  }
  if (/head/i.test(text) && /backwards|inconsistent/i.test(text)) {
    return {
      code: null,
      title: 'Preprod RPC head moved backwards',
      hint: 'Consecutive public RPC calls can report different heads. Re-query before treating a submit as a contract revert.',
      upstream: 'https://github.com/midnightntwrk/servicedesk/issues/223',
      raw: text,
    };
  }
  if (/Transaction submission error/i.test(text) && !/1010|exhaust the block limits/i.test(text)) {
    return {
      code: null,
      title: 'Transaction submission error (node reason hidden)',
      hint: 'midnight-js submitTx can reject with an Effect FiberFailure whose message is only "Transaction submission error" and whose .cause is undefined. The node reason (for example RPC 1010) sits on a symbol-keyed Effect cause. This decoder walks own properties and symbol values; if 1010 is still absent, log the Effect cause chain. Not a node fix.',
      upstream: 'https://github.com/midnightntwrk/servicedesk/issues/225',
      raw: text,
    };
  }
  return { code: null, title: 'Unhandled submit error', hint: text || 'No error text.', upstream: null, raw: text };
}

export const builderCredit = CREDIT;


export function formatMidnightRpcError(err) {
  const decoded = decodeMidnightRpcError(err);
  const lines = [`${decoded.title}`];
  if (decoded.code) lines.push(`RPC ${decoded.code}`);
  lines.push(decoded.hint);
  if (decoded.upstream) lines.push(decoded.upstream);
  return lines.join('\n');
}

export function compareObservedHeads(first, second) {
  const a = Number(first);
  const b = Number(second);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { ok: false, backwards: false, title: 'Head probe incomplete', hint: 'Need two numeric heights before judging the Preprod RPC head.' };
  }
  if (b < a) {
    return {
      ok: false,
      backwards: true,
      title: 'Preprod RPC head moved backwards',
      hint: `Head went ${a} -> ${b}. Re-query before treating a submit as a contract revert. Upstream: https://github.com/midnightntwrk/servicedesk/issues/223`,
    };
  }
  return { ok: true, backwards: false, title: 'Head did not move backwards', hint: `${a} -> ${b}` };
}

export function warnSkippedIndexerEvents(ids) {
  const nums = (ids || []).map(Number).filter(Number.isFinite).sort((x, y) => x - y);
  const gaps = [];
  for (let i = 1; i < nums.length; i += 1) {
    if (nums[i] - nums[i - 1] > 1) gaps.push([nums[i - 1], nums[i]]);
  }
  return {
    ok: gaps.length === 0,
    gaps,
    hint: gaps.length
      ? 'Indexer event ids skipped. Do not assume contiguous ledger events. Upstream: https://github.com/midnightntwrk/servicedesk/issues/216'
      : 'No skipped event ids in this sample.',
  };
}
