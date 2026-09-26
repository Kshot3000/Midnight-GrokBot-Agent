#!/usr/bin/env node
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { PREPROD, BRAND } from './preprod-config.mjs';
import { banner, section, kv, note, brandLine, printJson } from './cli-format.mjs';

setNetworkId(PREPROD.networkId);

banner('preprod-hello-stub · config', {
  claim: 'config-only — no submit, no deploy, no faucet credit',
});

section('Network');
kv('networkId', getNetworkId());
kv('indexer', PREPROD.indexer);
kv('node', PREPROD.node);
kv('proofServer', PREPROD.proofServer);
kv('faucet', PREPROD.faucet);

section('Next real steps');
note('Proof-server healthy locally on :6300 (reuse if already up)');
note('Generate throwaway wallet or supply MIDNIGHT_WALLET_* in .env.preprod');
note('Fund mn_addr_preprod via faucet (captcha) + register tDUST');
note('Wire full providers + deployContract — claim only after tx confirm');

printJson({
  claim: 'config-only — no submit, no deploy, no faucet credit',
  getNetworkId: getNetworkId(),
  endpoints: PREPROD,
  brand: BRAND,
});
brandLine();
