#!/usr/bin/env node
/**
 * Off-chain circuit exercise using the REAL Compact-generated Contract class.
 * This proves the JS module + compact-runtime pairing works.
 * It does NOT generate ZK proofs for chain submit, and does NOT deploy.
 */
import { pathToFileURL } from 'node:url';
import * as RT from '@midnight-ntwrk/compact-runtime';
import { HELLO_CONTRACT } from './paths.mjs';
import './check-artifacts.mjs'; // exits 1 if artifacts missing

const { Contract, ledger } = await import(pathToFileURL(HELLO_CONTRACT).href);

// hello.compact declares no witnesses — empty object is correct
const contract = new Contract({});
const COIN = '0'.repeat(64);
const ADDR = RT.sampleContractAddress();
const privateState = {};

const ctor = contract.initialState(RT.createConstructorContext(privateState, COIN));
const ctx0 = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, privateState);

const before = ledger(ctx0.currentQueryContext.state);
const call = contract.impureCircuits.increment(ctx0);
const after = ledger(call.context.currentQueryContext.state);

const report = {
  claim: 'off-chain circuit OK — NOT a Preprod deploy',
  artifact: HELLO_CONTRACT,
  greetings: { before: String(before.greetings), after: String(after.greetings) },
  hasProofData: Boolean(call.proofData),
  publicTranscriptLen: call.proofData?.publicTranscript?.length ?? 0,
  gasCostDefined: call.gasCost !== undefined,
};
console.log(JSON.stringify(report, null, 2));

if (after.greetings !== before.greetings + 1n) {
  console.error('Unexpected counter transition');
  process.exit(1);
}
