/**
 * Sample chain_getHeader on the documented Preprod RPC and report a backwards head.
 * Does not fix the public indexer or node. See servicedesk#223.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { PREPROD } from './preprod-config.mjs';
import { parseHeaderNumber, summarizeHeadSamples, builderCredit } from './head-consistency.mjs';

const samples = Number(process.env.HEAD_SAMPLES || 3);
const gapMs = Number(process.env.HEAD_GAP_MS || 1500);
const rpc = process.env.PREPROD_RPC || PREPROD.node;

async function one(id) {
  const started = Date.now();
  const response = await fetch(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method: 'chain_getHeader', params: [] }),
  });
  const ms = Date.now() - started;
  const body = await response.json();
  return { height: parseHeaderNumber(body?.result), ok: response.ok && body?.result != null, ms, status: response.status };
}

const rows = [];
for (let i = 0; i < samples; i += 1) {
  rows.push(await one(i + 1));
  if (i + 1 < samples) await new Promise((resolve) => setTimeout(resolve, gapMs));
}
const summary = summarizeHeadSamples(rows);
console.log(JSON.stringify({ rpc, docs: PREPROD.docs.networks, ...summary, credit: builderCredit }, null, 2));
if (!summary.monotonic) process.exitCode = 2;
