import { describe, it, expect } from 'vitest';
import {
  checkNetworkId,
  checkSubmitTransactionArgs,
  checkApiVersion,
  describeStaleLines,
  CONNECTOR_API_VERSION,
} from '../src/wallet-connector-stale-lines.mjs';

describe('wallet connector stale lines (midnight-docs#1569)', () => {
  it('accepts lowercase network ids and rejects capitalized ones', () => {
    expect(checkNetworkId('preprod').ok).toBe(true);
    expect(checkNetworkId('PreProd').ok).toBe(true);
    expect(checkNetworkId('PreProd').normalized).toBe('preprod');
    expect(checkNetworkId('Preview').normalized).toBe('preview');
    expect(checkNetworkId('not-a-net').ok).toBe(false);
  });

  it('rejects submitTransaction with a payFees options bag', () => {
    expect(checkSubmitTransactionArgs([{ tx: 1 }]).ok).toBe(true);
    expect(checkSubmitTransactionArgs([{ tx: 1 }, { payFees: true }]).ok).toBe(false);
    expect(checkSubmitTransactionArgs([]).ok).toBe(false);
  });

  it('requires the pinned apiVersion', () => {
    expect(checkApiVersion(CONNECTOR_API_VERSION).ok).toBe(true);
    expect(checkApiVersion('3.1.5').ok).toBe(false);
    expect(checkApiVersion('').ok).toBe(false);
  });

  it('cites the upstream issue', () => {
    const d = describeStaleLines();
    expect(d.upstream).toContain('1569');
    expect(d.pinned).toBe('4.0.1');
    expect(d.points.length).toBeGreaterThanOrEqual(4);
  });
});

/*
Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
*/
