/**
 * Classify the dust-successor gap recorded on servicedesk #112.
 * Does not call a wallet, indexer, or node. Does not reconstruct a UTXO.
 *
 * Official recovery: https://docs.midnight.network/concepts/dust-architecture
 * A DustSpend creates a new commitment. Wallets recover by identifying owned
 * NIGHT UTXOs and searching commitments for sequence numbers 0, 1, 2, ...
 * Issue 112 records that the public event exposes the successor commitment
 * but not backingNight, owner, nonce, sequence, value, or generation.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/112
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_DUST_SUCCESSOR =
  'https://github.com/midnightntwrk/servicedesk/issues/112';
export const OFFICIAL_DUST_RECOVERY =
  'https://docs.midnight.network/concepts/dust-architecture';

/** Field names as listed on servicedesk #112. Not a wallet SDK schema. */
export const SUCCESSOR_CLEARTEXT_FIELDS = [
  'backingNight',
  'owner',
  'nonce',
  'sequence',
  'value',
  'generation',
];

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function missingCleartext(cleartext) {
  const source = cleartext && typeof cleartext === 'object' ? cleartext : {};
  return SUCCESSOR_CLEARTEXT_FIELDS.filter((name) => {
    const value = source[name];
    return value == null || value === '';
  });
}

function hasPublicCommitment(publicEvent) {
  if (!publicEvent || typeof publicEvent !== 'object') return false;
  return Boolean(publicEvent.newCommitment || publicEvent.commitment);
}

/**
 * @param {{
 *   publicEvent?: { newCommitment?: string, commitment?: string, commitmentIndex?: number, dustSpendProcessed?: boolean },
 *   cleartext?: Record<string, unknown>,
 *   exportedUtxo?: boolean,
 *   unrelatedGenerationUtxoPresent?: boolean
 * }} [input]
 */
export function classifyDustSuccessorGap(input = {}) {
  const publicEvent = input.publicEvent || {};
  const missing = missingCleartext(input.cleartext);
  const base = {
    upstream: UPSTREAM_DUST_SUCCESSOR,
    official: OFFICIAL_DUST_RECOVERY,
    fixesWallet: false,
    fixesIndexer: false,
    fixesNode: false,
    credit: CREDIT,
  };

  if (!hasPublicCommitment(publicEvent)) {
    return {
      ...base,
      ok: false,
      classification: 'no-public-commitment',
      recoverableFromIndexerEvent: false,
      missingCleartext: missing,
      hint: 'No successor commitment on the public event. This is not the servicedesk #112 shape.',
    };
  }

  if (input.exportedUtxo) {
    return {
      ...base,
      ok: true,
      classification: 'successor-exported',
      recoverableFromIndexerEvent: false,
      missingCleartext: missing,
      hint: 'Local export already has the successor UTXO. Nothing to classify as the #112 gap.',
    };
  }

  if (missing.length === SUCCESSOR_CLEARTEXT_FIELDS.length) {
    return {
      ...base,
      ok: false,
      classification: 'public-commitment-without-cleartext',
      recoverableFromIndexerEvent: false,
      missingCleartext: missing,
      commitmentIndex: publicEvent.commitmentIndex ?? null,
      dustSpendProcessed: Boolean(publicEvent.dustSpendProcessed),
      unrelatedGenerationUtxoPresent: Boolean(input.unrelatedGenerationUtxoPresent),
      hint:
        'The public DustSpend event exposes the successor commitment, not the cleartext fields servicedesk #112 lists. Official wallet recovery searches commitments by sequence from an owned NIGHT UTXO (https://docs.midnight.network/concepts/dust-architecture). An unrelated generation UTXO being present does not reconstruct this successor. This lab does not rebuild the UTXO and does not fix the wallet, indexer, or node.',
    };
  }

  return {
    ...base,
    ok: false,
    classification: 'partial-cleartext',
    recoverableFromIndexerEvent: false,
    missingCleartext: missing,
    hint: 'Some cleartext fields are present and some are not. Do not treat a partial public event as a reconstructed successor UTXO.',
  };
}
