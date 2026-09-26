import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
/** Repo-root contracts/hello-midnight/out (gitignored — regenerate with npm run compact:hello) */
export const HELLO_OUT = path.resolve(here, '../../../contracts/hello-midnight/out');
export const HELLO_CONTRACT = path.join(HELLO_OUT, 'contract', 'index.js');
export const HELLO_KEYS = path.join(HELLO_OUT, 'keys');
export const HELLO_ZKIR = path.join(HELLO_OUT, 'zkir');

/** Repo-root contracts/agent-escrow managed tree (gitignored — npm run compact:escrow) */
export const ESCROW_OUT = path.resolve(
  here,
  '../../../contracts/agent-escrow/src/managed/agent-escrow',
);
export const ESCROW_CONTRACT = path.join(ESCROW_OUT, 'contract', 'index.js');
export const ESCROW_KEYS = path.join(ESCROW_OUT, 'keys');
export const ESCROW_ZKIR = path.join(ESCROW_OUT, 'zkir');

/** Impure circuits with proving keys (12). Pure helpers roleCommitment/tags have no ZK keys. */
export const ESCROW_CIRCUITS = Object.freeze([
  'initialize',
  'addMilestone',
  'fund',
  'start',
  'submitProof',
  'approve',
  'reject',
  'dispute',
  'resolveDisputeRefund',
  'resolveDisputeResume',
  'settle',
  'cancel',
]);
