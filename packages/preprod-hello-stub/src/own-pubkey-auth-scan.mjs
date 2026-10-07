/**
 * Flag Compact source that uses ownPublicKey() as caller verification.
 * Official docs say that call is a witness the prover controls. This scanner
 * does not compile Compact and does not deploy.
 *
 * Official: https://docs.midnight.network/guides/security-best-practices
 * Official: https://docs.midnight.network/compact/smart-contract-security
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/902
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/902';
export const DOCS_SECURITY = 'https://docs.midnight.network/guides/security-best-practices';
export const DOCS_COMPACT = 'https://docs.midnight.network/compact/smart-contract-security';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * @param {string} source
 */
export function scanOwnPublicKeyAuth(source) {
  const text = stripComments(String(source || ''));
  const lines = text.split(/\r?\n/);
  const hits = [];
  lines.forEach((line, index) => {
    if (!/ownPublicKey\s*\(/.test(line)) return;
    const authUse = /assert\s*\(/.test(line) || /==/.test(line) || /\.bytes/.test(line);
    if (!authUse) return;
    hits.push({ line: index + 1, text: line.trim() });
  });
  const derived = /derivePublicKey|persistentHash/.test(text) && /secretKey\s*\(/.test(text);
  return {
    ok: hits.length === 0,
    classification: hits.length ? 'ownPublicKey-as-caller-auth' : 'no-ownPublicKey-auth-assert',
    hits,
    usesDerivedIdentity: derived,
    upstream: UPSTREAM,
    docs: [DOCS_SECURITY, DOCS_COMPACT],
    claim: 'source scan only — not a compiler, node, or indexer fix',
    credit: CREDIT,
    hint: hits.length
      ? 'Official security pages say ownPublicKey() is a witness. assert(ownPublicKey().bytes == owner) compares two prover-controlled values. Derive identity from a secret the caller must know, then disclose only the hash.'
      : 'No assert or equality on ownPublicKey() in non-comment source. A safe pattern hashes secretKey() with a domain separator.',
  };
}

export const ownPublicKeyAuthCredit = CREDIT;
