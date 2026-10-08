import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  checkEffectstreamGuidePin,
  checkEffectstreamRcSource,
} from '../src/effectstream-rc-pin.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  join(here, '../../../contracts/hello-midnight/effectstream-rc-pin.compact'),
  'utf8',
);

describe('effectstream rc pin', () => {
  it('keeps the lab contract on language 0.22–0.23', () => {
    const result = checkEffectstreamRcSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.toolchain).toBe('0.31.1');
  });

  it('flags the published guide rc and language floor', () => {
    const bad = [
      'download compactc_v0.33.0-rc.2_<target>.zip',
      'pragma language_version >= 0.17 ;',
    ].join('\n');
    const result = checkEffectstreamGuidePin(bad);
    expect(result.ok).toBe(false);
    expect(result.findings).toHaveLength(2);
    expect(result.upstream).toContain('midnight-docs/issues/1245');
  });

  it('accepts matrix-aligned guide text', () => {
    const ok = 'Use Compact toolchain 0.31.1 and pragma language_version >= 0.22 && <= 0.23.';
    const result = checkEffectstreamGuidePin(ok);
    expect(result.ok).toBe(true);
    expect(result.findings).toEqual([]);
  });
});
