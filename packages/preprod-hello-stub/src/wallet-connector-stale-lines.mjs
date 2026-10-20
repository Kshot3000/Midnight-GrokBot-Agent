/**
 * Classify pasted snippets against the stale lines in midnight-docs#1569.
 * Does not call a wallet, the indexer, or the node.
 *
 * Official: https://docs.midnight.network/api-reference/dapp-connector/type-aliases/WalletConnectedAPI
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1569
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1569';
export const API_DOCS =
  'https://docs.midnight.network/api-reference/dapp-connector/type-aliases/WalletConnectedAPI';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} snippet
 */
export function classifyWalletConnectorSnippet(snippet) {
  const text = String(snippet ?? '');
  const findings = [];

  if (/submitTransaction\s*\([^)]*payFees/i.test(text) || /submitTransaction\s*\(\s*[^,)]+\s*,\s*\{[^}]*payFees/i.test(text)) {
    findings.push({
      kind: 'payfees-on-submit',
      detail:
        'WalletConnectedAPI 4.0.1 submitTransaction takes only the sealed transaction. payFees is on makeTransfer, makeIntent, and the balance methods.',
    });
  }

  if (/['"]Preview['"]|['"]PreProd['"]|['"]Undeployed['"]/.test(text)) {
    findings.push({
      kind: 'capitalized-network-id',
      detail:
        'Issue #1569 notes SDK network IDs are preview, preprod, undeployed. Capitalized forms may be refused. Only mainnet is fixed by the spec.',
    });
  }

  if (/selectWallet/.test(text) && !/apiVersion/.test(text)) {
    findings.push({
      kind: 'missing-api-version',
      detail: 'selectWallet does not filter on apiVersion. The spec says a DApp must.',
    });
  }

  if (/proverServerUri/.test(text) && !/deprecated|getProvingProvider/.test(text)) {
    findings.push({
      kind: 'deprecated-prover-uri',
      detail:
        'proverServerUri is optional and deprecated (planned removal in 5.0.0). Prefer getProvingProvider() with a fallback.',
    });
  }

  return {
    ok: findings.length === 0,
    findings,
    title: findings.length === 0 ? 'no stale pattern matched' : 'stale connector pattern',
    upstream: UPSTREAM,
    docs: API_DOCS,
    claim: 'sample classification only — not a public docs, indexer, or node fix',
    credit: CREDIT,
  };
}

export const walletConnectorStaleCredit = CREDIT;
