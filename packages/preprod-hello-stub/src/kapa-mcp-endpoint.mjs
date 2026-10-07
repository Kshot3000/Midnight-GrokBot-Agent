/**
 * Classify a Midnight docs MCP URL against the published Kapa endpoint.
 * Does not call the network and does not invent client install commands.
 *
 * Official sources read 2026-10-07:
 *   https://docs.midnight.network/ai-integration/kapa-mcp-server
 *   https://docs.midnight.network/blog/migrating-to-kapa-and-midnight-expert
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1384
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const OFFICIAL_KAPA_MCP_URL = 'https://midnight.mcp.kapa.ai';

/** Gaps issue #1384 asked for that the published page still does not answer. */
export const UNANSWERED_CLIENT_GAPS = Object.freeze([
  'codex-install',
  'opencode-auth',
  'authentication-required',
]);

export function classifyMcpUrl(url) {
  const raw = String(url || '').trim();
  const failures = [];
  if (!raw) failures.push('url is empty');
  let host = '';
  try {
    const parsed = new URL(raw);
    host = parsed.host;
    if (parsed.protocol !== 'https:') failures.push('endpoint must be https');
    if (parsed.pathname !== '/' && parsed.pathname !== '') {
      failures.push('published endpoint has no path');
    }
  } catch {
    failures.push('url is not parseable');
  }
  const official = raw === OFFICIAL_KAPA_MCP_URL;
  if (!official && failures.length === 0) {
    failures.push('host is not the published Kapa MCP endpoint');
  }
  return {
    ok: official && failures.length === 0,
    official,
    host,
    failures,
    endpoint: OFFICIAL_KAPA_MCP_URL,
    upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1384',
  };
}

export function remainingClientGaps(pageText) {
  const text = String(pageText || '');
  const gaps = [];
  if (!/codex/i.test(text)) gaps.push('codex-install');
  if (!/opencode/i.test(text)) gaps.push('opencode-auth');
  if (!/authentication/i.test(text)) gaps.push('authentication-required');
  return {
    ok: gaps.length === 0,
    gaps,
    expected: UNANSWERED_CLIENT_GAPS,
    upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1384',
  };
}
