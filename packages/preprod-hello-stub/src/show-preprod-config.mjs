#!/usr/bin/env node
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { PREPROD, BRAND } from './preprod-config.mjs';

setNetworkId(PREPROD.networkId);
console.log(
  JSON.stringify(
    {
      claim: 'config-only — no submit, no deploy, no faucet credit',
      getNetworkId: getNetworkId(),
      endpoints: PREPROD,
      nextRealSteps: [
        'Proof-server healthy locally on :6300 (reuse if already up)',
        'Generate throwaway wallet or supply MIDNIGHT_WALLET_* in .env.preprod',
        'Fund mn_addr_preprod via faucet (captcha) + register tDUST',
        'Wire full providers (wallet slots) + deployContract — claim only after tx confirm',
      ],
      brand: BRAND,
    },
    null,
    2,
  ),
);
