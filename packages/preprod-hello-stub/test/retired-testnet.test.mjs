import { describe, expect, it } from 'vitest';
import {
  assertNoRetiredTestnet,
  classifyRetiredEndpoint,
  CURRENT_PUBLIC,
} from '../src/retired-testnet.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('retired testnet-02', () => {
  it('names the retired hostname and the official replacements', () => {
    const classified = classifyRetiredEndpoint(
      'https://indexer.testnet-02.midnight.network/api/v4/graphql',
    );
    expect(classified.retired).toBe(true);
    expect(classified.host).toBe('testnet-02.midnight.network');
    expect(classified.upstream).toMatch(/midnight-docs\/issues\/1172/);
    expect(classified.docs).toBe(
      'https://docs.midnight.network/guides/networks-and-environments',
    );
    expect(classified.replacement.preprod.node).toBe(CURRENT_PUBLIC.preprod.node);
    expect(classified.replacement.preview.indexer).toMatch(/indexer\.preview\.midnight\.network/);
  });

  it('leaves current Preprod and Preview URLs alone', () => {
    expect(classifyRetiredEndpoint(CURRENT_PUBLIC.preprod.node)).toBe(null);
    expect(classifyRetiredEndpoint(CURRENT_PUBLIC.preview.indexer)).toBe(null);
    expect(classifyRetiredEndpoint('getaddrinfo ENOTFOUND rpc.preprod.midnight.network')).toBe(null);
  });

  it('refuses a config that still points a node URL at testnet-02', () => {
    expect(() =>
      assertNoRetiredTestnet({
        MIDNIGHT_NODE_URL: 'https://rpc.testnet-02.midnight.network',
        MIDNIGHT_INDEXER_URL: CURRENT_PUBLIC.preprod.indexer,
      }),
    ).toThrow(/RETIRED|Retired testnet-02/);
  });
});
