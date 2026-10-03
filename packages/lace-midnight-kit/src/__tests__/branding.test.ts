import { describe, expect, it } from 'vitest';
import { LAB_BRANDING } from '../index.js';

describe('LAB_BRANDING', () => {
  it('points NightDream at the live custom domain, not the dead one', () => {
    // nightdream.io is NXDOMAIN (see contracts/AUDIT-NOTES.md); the live
    // site is nightdream.xyz. The Lace studio footer renders this URL.
    expect(LAB_BRANDING.nightDreamUrl).toBe('https://nightdream.xyz');
  });

  it('carries the canonical attribution + donation address', () => {
    expect(LAB_BRANDING.xHandle).toBe('@kshot9000');
    expect(LAB_BRANDING.xUrl).toBe('https://x.com/kshot9000');
    expect(LAB_BRANDING.repoUrl).toBe(
      'https://github.com/Kshot3000/Midnight-GrokBot-Agent',
    );
    expect(LAB_BRANDING.donationAddressAda).toBe(
      'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
    );
  });
});
