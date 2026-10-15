/**
 * Source check for the pure-interface lab contract.
 * Does not compile Compact, does not call midnight-js, and does not call a proof server.
 * Official: https://docs.midnight.network/compact/lang-ref
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/249
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PURE_INTERFACE =
  'https://github.com/midnightntwrk/servicedesk/issues/249';
export const OFFICIAL_PURE =
  'https://docs.midnight.network/compact/lang-ref';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * @param {string} source Compact source
 * @returns {{ok: boolean, failures: string[], hints: string[], upstream: string, official: string, credit: string}}
 */
export function checkPureInterfaceSource(source) {
  const code = stripComments(source);
  const failures = [];
  const hints = [];

  const hasPureExport = /export\s+pure\s+circuit\s+double\s*\(/.test(code);
  if (!hasPureExport) {
    failures.push('lab contract must export pure circuit double(n: Uint<64>)');
    hints.push('see contracts/hello-midnight/pure-interface.compact');
  }

  // Flag pure circuits declared inside a contract type. Issue #249: they compile, then calls refuse.
  const typeBlock = /contract\s+\w+\s*\{([\s\S]*?)\}/.exec(code);
  if (typeBlock && /pure\s+circuit\s+\w+/.test(typeBlock[1])) {
    failures.push(
      'pure circuit inside a contract type declaration is the #249 refusal: ModuleResolutionError kind PureInterfaceCircuit',
    );
    hints.push(
      'keep the pure circuit on the implementing contract and call it via pureCircuits; do not declare it pure on the type used for cross-contract calls',
    );
  }

  if (/ledger\s+\w+/.test(code) && hasPureExport) {
    // double must not touch ledger; the file has none.
    failures.push('pure circuit double must not share a file with a ledger write');
  }

  return {
    ok: failures.length === 0,
    failures,
    hints,
    upstream: UPSTREAM_PURE_INTERFACE,
    official: OFFICIAL_PURE,
    pins: {
      compact: '0.31.1',
      language: '>= 0.23',
      midnightJs: '4.1.1',
    },
    credit: CREDIT,
  };
}

const sample = process.argv[2];
if (sample && import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const report = checkPureInterfaceSource(fs.readFileSync(sample, 'utf8'));
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}
