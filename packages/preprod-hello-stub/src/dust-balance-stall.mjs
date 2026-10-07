/**
 * Bound a DUST balance call that may never return.
 * Official facade methods (do not invent others):
 * https://docs.midnight.network/api-reference/wallet-sdk
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/194
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_DUST_BALANCE_STALL = 'https://github.com/midnightntwrk/servicedesk/issues/194';
export const UPSTREAM_FIX_PR = 'https://github.com/midnightntwrk/midnight-wallet/pull/741';
export const OFFICIAL_WALLET_FACADE = 'https://docs.midnight.network/api-reference/wallet-sdk';

/** Documented facade entry points. Not a new SDK. */
export const DOCUMENTED_BALANCE_METHODS = [
  'balanceUnboundTransaction',
  'balanceFinalizedTransaction',
  'finalizeRecipe',
];

export class DustBalanceStallError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'DustBalanceStallError';
    this.details = details;
  }
}

/**
 * Classify a finished or timed-out balance observation.
 * A silent spin is not an InsufficientFundsError: the dust balancer
 * never returns when the fee loop stops selecting coins.
 */
export function classifyBalanceObservation(observation) {
  const elapsedMs = Number(observation?.elapsedMs ?? 0);
  const rssGrowthBytes = Number(observation?.rssGrowthBytes ?? 0);
  const errorMessage = observation?.errorMessage ? String(observation.errorMessage) : '';
  const selectedCoins = observation?.selectedCoins;
  const deadlineMs = Number(observation?.deadlineMs ?? 0);
  const reasons = [];

  if (errorMessage && /InsufficientFunds/i.test(errorMessage)) {
    reasons.push('named InsufficientFundsError; not the silent dust loop');
  }
  if (!errorMessage && deadlineMs > 0 && elapsedMs >= deadlineMs) {
    reasons.push('balance call passed the local deadline with no rejection');
  }
  if (selectedCoins === 0) {
    reasons.push('dust pass selected zero coins; servicedesk#194 describes this fixed point');
  }
  if (rssGrowthBytes >= 256 * 1024 * 1024) {
    reasons.push('RSS grew by at least 256 MiB during balance; matches the reported WASM churn');
  }

  const stalled = reasons.some((reason) => /deadline|zero coins|256 MiB/.test(reason));
  return {
    stalled,
    reasons,
    methods: DOCUMENTED_BALANCE_METHODS,
    upstream: UPSTREAM_DUST_BALANCE_STALL,
    fixPr: UPSTREAM_FIX_PR,
    official: OFFICIAL_WALLET_FACADE,
    sdkFixedHere: false,
  };
}

export function withBalanceDeadline(work, deadlineMs, clock = {}) {
  const limit = Number(deadlineMs);
  if (!Number.isFinite(limit) || limit <= 0) {
    return Promise.reject(new DustBalanceStallError('deadlineMs must be a positive number', { deadlineMs }));
  }
  const setTimer = clock.setTimer || ((fn, ms) => setTimeout(fn, ms));
  const clearTimer = clock.clearTimer || ((id) => clearTimeout(id));
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimer(() => {
      if (settled) return;
      settled = true;
      const details = classifyBalanceObservation({ elapsedMs: limit, deadlineMs: limit, selectedCoins: null });
      reject(new DustBalanceStallError(
        'DUST balance deadline exceeded before submit (servicedesk#194). This lab did not fix wallet-sdk.',
        details,
      ));
    }, limit);
    Promise.resolve()
      .then(work)
      .then((value) => {
        if (settled) return;
        settled = true;
        clearTimer(timer);
        resolve(value);
      })
      .catch((err) => {
        if (settled) return;
        settled = true;
        clearTimer(timer);
        reject(err);
      });
  });
}
