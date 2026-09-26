#!/usr/bin/env node
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { PREPROD } from './preprod-config.mjs';

setNetworkId(PREPROD.networkId);
console.log(
  JSON.stringify(
    {
      claim: 'config-only — no submit, no deploy, no faucet',
      getNetworkId: getNetworkId(),
      endpoints: PREPROD,
      nextRealSteps: [
        'Run proof-server 8.1.0 locally (podman/docker) on :6300',
        'Fund + register a Preprod wallet for tDUST',
        'Wire midnight-js providers + deployContract against compiled artifacts',
      ],
      brand: {
        donate:
          'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
        x: '@kshot9000',
      },
    },
    null,
    2,
  ),
);
