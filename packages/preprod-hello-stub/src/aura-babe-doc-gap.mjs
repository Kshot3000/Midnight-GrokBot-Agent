/**
 * Classify builder notes against the published Midnight consensus docs.
 * Does not query a node and does not claim a BABE migration has shipped.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1092';
export const OFFICIAL_CONSENSUS = 'https://docs.midnight.network/concepts/network-architecture/consensus';
export const OFFICIAL_NODES = 'https://docs.midnight.network/nodes';

const BABE_NOW = /\b(babe|blind assignment for blockchain extension)\b/i;
const DROP_AURA = /\b(drop|replace|obsolete|retire|stop using)\b[\s\S]{0,40}\baura\b|\baura\b[\s\S]{0,40}\b(obsolete|retired|replaced)\b/i;
const MINT_BABE = /\b(generate|mint|register|insert)\b[\s\S]{0,40}\bbabe\b[\s\S]{0,24}\b(key|session)/i;

export function classifyConsensusDoc(text) {
  const body = String(text ?? '');
  const namesAura = /\bAURA\b/.test(body);
  const namesGrandpa = /\bGRANDPA\b/.test(body);
  const namesBabe = BABE_NOW.test(body);
  return {
    officialStillAura: namesAura && namesGrandpa && !namesBabe,
    namesAura,
    namesGrandpa,
    namesBabe,
  };
}

export function classifyAuraBabeNote(note, officialText) {
  const text = String(note ?? '');
  const official = classifyConsensusDoc(officialText);
  const failures = [];
  const assumesBabeCurrent = MINT_BABE.test(text) || (BABE_NOW.test(text) && DROP_AURA.test(text));
  if (assumesBabeCurrent && official.officialStillAura) {
    failures.push(
      'note treats BABE keys as current while official consensus and node pages still name AURA block production and GRANDPA finality',
    );
  }
  if (assumesBabeCurrent && !official.namesAura) {
    failures.push('official snapshot did not name AURA; refuse to infer a BABE cutover');
  }
  return {
    ok: failures.length === 0,
    failures,
    assumesBabeCurrent,
    officialStillAura: official.officialStillAura,
    authorshipSigning: official.namesAura ? 'sr25519 (AURA block authorship, official nodes page)' : 'unknown',
    upstream: UPSTREAM,
    official: [OFFICIAL_CONSENSUS, OFFICIAL_NODES],
    doesNotFixPublicNode: true,
  };
}
