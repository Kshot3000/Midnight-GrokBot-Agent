import { describe, expect, it } from 'vitest';
import {
  MidnightNetworkIds,
  NETWORK_CATALOG,
  describeNetworkSwitch,
  findNetworkCatalogEntry,
} from '../networks.js';

describe('NETWORK_CATALOG', () => {
  it('includes preprod as recommended default', () => {
    expect(NETWORK_CATALOG.length).toBeGreaterThanOrEqual(4);
    const preprod = findNetworkCatalogEntry(MidnightNetworkIds.Preprod);
    expect(preprod?.recommended).toBe(true);
    expect(findNetworkCatalogEntry(MidnightNetworkIds.Mainnet)?.connectOnly).toBe(
      true,
    );
  });
});

describe('describeNetworkSwitch', () => {
  it('no-op when unchanged', () => {
    const plan = describeNetworkSwitch('preprod', 'preprod');
    expect(plan.changed).toBe(false);
    expect(plan.requiresReconnect).toBe(false);
  });

  it('requires reconnect when switching away from a live network', () => {
    const plan = describeNetworkSwitch('preprod', 'preview');
    expect(plan.changed).toBe(true);
    expect(plan.requiresReconnect).toBe(true);
    expect(plan.message.toLowerCase()).toContain('reconnect');
  });

  it('warns on mainnet connect-only', () => {
    const plan = describeNetworkSwitch(null, MidnightNetworkIds.Mainnet);
    expect(plan.changed).toBe(true);
    expect(plan.message.toLowerCase()).toContain('connect');
    expect(plan.message.toLowerCase()).toContain('transfer');
  });
});
