import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  OFFICIAL_KAPA_MCP_URL,
  classifyMcpUrl,
  remainingClientGaps,
} from '../src/kapa-mcp-endpoint.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const PUBLISHED_PAGE = [
  'claude mcp add --transport http midnight https://midnight.mcp.kapa.ai',
  'Cursor and VS Code one-click from Ask AI, Use MCP',
  'generic mcpServers http url https://midnight.mcp.kapa.ai',
].join('\n');

describe('kapa mcp endpoint', () => {
  it('accepts only the published https endpoint', () => {
    const result = classifyMcpUrl(OFFICIAL_KAPA_MCP_URL);
    assert.equal(result.ok, true);
    assert.equal(result.host, 'midnight.mcp.kapa.ai');
    assert.deepEqual(result.failures, []);
  });

  it('rejects a reconstructed host and a non-https URL', () => {
    assert.equal(classifyMcpUrl('https://mcp.midnight.network').ok, false);
    assert.equal(classifyMcpUrl('http://midnight.mcp.kapa.ai').ok, false);
    assert.match(classifyMcpUrl('').failures.join(' '), /empty/);
  });

  it('keeps the issue #1384 client gaps the published page does not close', () => {
    const result = remainingClientGaps(PUBLISHED_PAGE);
    assert.equal(result.ok, false);
    assert.deepEqual(result.gaps, [
      'codex-install',
      'opencode-auth',
      'authentication-required',
    ]);
  });

  it('matches the lab note citation', () => {
    const note = readFileSync(
      new URL('../../../docs/KAPA-MCP-CLIENT-GAP.md', import.meta.url),
      'utf8',
    );
    assert.match(note, /midnight-docs#1384/);
    assert.match(note, /midnight\.mcp\.kapa\.ai/);
    assert.doesNotMatch(note, /opencode mcp auth midnight is the official/);
  });
});
