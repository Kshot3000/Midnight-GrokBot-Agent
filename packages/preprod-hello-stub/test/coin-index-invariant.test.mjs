import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkCoinIndexGap } from '../src/coin-index-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(
  new URL('../../../contracts/hello-midnight/coin-index-gap.compact', import.meta.url),
  'utf8',
);

describe('coin index gap invariant', () => {
  it('accepts a commitment receipt that never calls writeCoin', () => {
    const result = checkCoinIndexGap(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.upstream).toContain('servicedesk/issues/213');
    expect(result.official).toContain('docs.midnight.network/compact/data-types/ledger-adt');
    expect(result.credit).toContain('Email: kshot9000@gmail.com');
  });

  it('rejects a QualifiedShieldedCoinInfo cell filled by writeCoin', () => {
    const bad = `
      pragma language_version 0.23;
      export ledger held: QualifiedShieldedCoinInfo;
      export circuit take(coin: ShieldedCoinInfo): [] {
        held.writeCoin(coin, right<ZswapCoinPublicKey, ContractAddress>(ownContractAddress()));
        persistentCommit<Bytes<32>>(localRand(), localRand());
        disclose(localRand());
      }
    `;
    const result = checkCoinIndexGap(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/value/);
    expect(result.failures.join(' ')).toMatch(/writeCoin/);
  });

  it('rejects an invented writeCoin-to-Uint overload', () => {
    const bad = `
      pragma language_version 0.23;
      export ledger mt: Uint<64>;
      export circuit take(coin: ShieldedCoinInfo): [] {
        mt.writeCoin(coin);
        persistentCommit<Bytes<32>>(localRand(), localRand());
        disclose(localRand());
      }
    `;
    const result = checkCoinIndexGap(bad + "\n// writeCoin only mtIndex\n");
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/writeCoin|do not invent/);
  });
});
