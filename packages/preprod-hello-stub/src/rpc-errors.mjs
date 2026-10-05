/**
 * Decode Midnight node / indexer failures that otherwise look like
 * a generic "Transaction submission error".
 *
 * Does not invent RPC methods. Maps strings already returned by the
 * public Preprod node and indexer. Upstream: midnightntwrk/servicedesk#225
 * (RPC 1010 block-limit) and #230 (Preprod indexer stall).
 * LOCAL-TRUE helper. Not a node fix.
 * Credit: @kshot9000 https://x.com/kshot9000
 * Donate ADA: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK
 * Built by @kshot9000 https://x.com/kshot9000
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function decodeMidnightRpcError(err) {
  const raw = typeof err === 'string' ? err : err?.message || err?.cause?.message || String(err ?? '');
  const text = raw.replace(/\s+/g, ' ').trim();
  const code = /1010/.test(text) ? 1010 : null;

  if (code === 1010 || /exhaust the block limits/i.test(text)) {
    return {
      code: 1010,
      title: 'Transaction would exhaust the block limits',
      hint: 'The node rejected the tx before it was a proof or balance failure. Shrink the call, drop extra contract maintenance, or retry when the block is less full. Official node text is RPC 1010.',
      upstream: 'https://github.com/midnightntwrk/servicedesk/issues/225',
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
  return { code: null, title: 'Unhandled submit error', hint: text || 'No error text.', upstream: null, raw: text };
}

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
