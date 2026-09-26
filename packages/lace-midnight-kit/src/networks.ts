/**
 * Common Midnight network id strings used with InitialAPI.connect(networkId).
 * Prefer test / preview networks for demos. Do not assume mainnet transfers work
 * until you have verified your Lace + connector + ledger stack against the
 * official compatibility matrix.
 *
 * Official guide examples use values such as `preprod`, `preview`, `undeployed`.
 * Spec uses `mainnet` for mainnet.
 */
export const MidnightNetworkIds = {
  /** Local / undeployed development */
  Undeployed: 'undeployed',
  /** Preview test network */
  Preview: 'preview',
  /** Preprod test network (common Lace Midnight target) */
  Preprod: 'preprod',
  /** Mainnet — transfers require a fully working wallet + funded account */
  Mainnet: 'mainnet',
} as const;

export type MidnightNetworkId =
  | (typeof MidnightNetworkIds)[keyof typeof MidnightNetworkIds]
  | (string & {});

/** Default network for this lab's demo: Preprod (test). */
export const DEFAULT_DEMO_NETWORK: MidnightNetworkId =
  MidnightNetworkIds.Preprod;
