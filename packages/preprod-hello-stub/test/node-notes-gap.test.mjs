import { describe, expect, it } from 'vitest';
import {
  classifyNodeNotesGap,
  DOCUMENTED_NOTES_VERSION,
  PUBLIC_RUNTIME_CITED,
  TOOLKIT_FAILURE,
} from '../src/node-notes-gap.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('node 1.0.300 notes gap', () => {
  it('records the 404 while 1.0.2 notes cite runtime 1.0.300', () => {
    const result = classifyNodeNotesGap();
    expect(result.classification).toBe('docs-behind-public-runtime');
    expect(result.documentedNotes).toBe(DOCUMENTED_NOTES_VERSION);
    expect(result.publicRuntime).toBe(PUBLIC_RUNTIME_CITED);
    expect(result.notesPageExists).toBe(false);
    expect(result.toolkitFailure).toBe(TOOLKIT_FAILURE);
    expect(result.upstream).toContain('midnight-docs/issues/1390');
    expect(result.missing).toContain('node-1-0-300');
    expect(result.hint).toMatch(/not fix the public indexer or node/i);
  });

  it('aligns once a notes page exists for that runtime', () => {
    const result = classifyNodeNotesGap({
      documentedNotes: '1.0.300',
      publicRuntime: '1.0.300',
      notesPageExists: true,
    });
    expect(result.classification).toBe('aligned');
    expect(result.ok).toBe(true);
  });

  it('fails closed on a non-version', () => {
    const result = classifyNodeNotesGap({ documentedNotes: 'latest' });
    expect(result.classification).toBe('incomplete');
    expect(result.ok).toBe(false);
  });
});
