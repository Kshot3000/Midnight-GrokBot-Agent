/**
 * Decode Midnight node / indexer failures that otherwise look like
 * a generic "Transaction submission error".
 *
 * Does not invent RPC methods. Maps strings already returned by the
 * public Preprod node and indexer. Upstream: midnightntwrk/servicedesk#225
 * (RPC 1010 block-limit) and #230 (Preprod indexer stall).
 * LOCAL-TRUE helper. Not a node fix.
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
