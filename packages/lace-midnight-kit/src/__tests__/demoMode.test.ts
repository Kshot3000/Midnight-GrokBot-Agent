import { describe, expect, it } from 'vitest';

import { createDemoSession } from '../demoMode.js';
import { injectionKindForKey } from '../discover.js';

describe('demo session provider shape', () => {
  it('carries a complete DiscoveredProvider (injectionKind included)', () => {
    const session = createDemoSession();
    // demoMode once omitted injectionKind, which broke `tsc` (kit build)
    // while vitest stayed green — pin the shape at runtime too.
    expect(session.provider.injectionKey).toBe('demo-simulated-key');
    expect(session.provider.injectionKind).toBe(
      injectionKindForKey(session.provider.injectionKey),
    );
    expect(session.provider.injectionKind).toBe('v4');
    expect(session.provider.api).toBeTruthy();
  });
});
