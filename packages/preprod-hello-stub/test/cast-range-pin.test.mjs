import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkCastRangeSource, checkGuidePin } from '../src/cast-range-pin.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  join(here, '../../../contracts/hello-midnight/cast-range-pin.compact'),
  'utf8',
);

describe('cast range pin', () => {
  it('keeps an explicit Uint<8> bound on the lab contract', () => {
    const result = checkCastRangeSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('flags a 0.31.0 pin and a disclose-publishes sentence', () => {
    const bad = [
      'Run `compact update 0.31.0` before the template.',
      'See what a `disclose()` call publishes on the other chain.',
      'Then read [bun](./install-bun-runtime-midnight).',
    ].join('\n');
    const result = checkGuidePin(bad);
    expect(result.ok).toBe(false);
    expect(result.findings).toHaveLength(3);
    expect(result.upstream).toContain('midnight-docs/issues/1245');
  });
});
