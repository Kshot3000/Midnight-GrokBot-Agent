/**
 * Labeled connect journey phases for UX steppers.
 * Pure state machine — does not call the wallet; the demo drives transitions.
 */

export const ConnectJourneyPhases = [
  'idle',
  'discovering',
  'ready_to_connect',
  'awaiting_wallet',
  'reading_status',
  'reading_addresses',
  'connected',
  'error',
] as const;

export type ConnectJourneyPhase = (typeof ConnectJourneyPhases)[number];

export type ConnectJourneyStep = {
  id: ConnectJourneyPhase;
  label: string;
  hint: string;
};

/** Ordered steps shown in the demo stepper (error is parallel, not sequential). */
export const CONNECT_JOURNEY_STEPS: readonly ConnectJourneyStep[] = [
  {
    id: 'idle',
    label: 'Idle',
    hint: 'Waiting to probe window.midnight',
  },
  {
    id: 'discovering',
    label: 'Discover',
    hint: 'Enumerate providers (UUID keys / rdns)',
  },
  {
    id: 'ready_to_connect',
    label: 'Ready',
    hint: 'Wallet selected — pick a network',
  },
  {
    id: 'awaiting_wallet',
    label: 'Approve',
    hint: 'Lace prompts the user to approve connect()',
  },
  {
    id: 'reading_status',
    label: 'Status',
    hint: 'Read getConnectionStatus()',
  },
  {
    id: 'reading_addresses',
    label: 'Addresses',
    hint: 'Read unshielded / shielded / dust (best-effort)',
  },
  {
    id: 'connected',
    label: 'Connected',
    hint: 'Session ready — still no transfers',
  },
] as const;

export type ConnectJourneyState = {
  phase: ConnectJourneyPhase;
  detail: string;
  startedAt: string | null;
  updatedAt: string;
};

export function createConnectJourney(
  initial: ConnectJourneyPhase = 'idle',
): ConnectJourneyState {
  const now = new Date().toISOString();
  return {
    phase: initial,
    detail: CONNECT_JOURNEY_STEPS.find((s) => s.id === initial)?.hint ?? '',
    startedAt: null,
    updatedAt: now,
  };
}

export function advanceConnectJourney(
  state: ConnectJourneyState,
  phase: ConnectJourneyPhase,
  detail?: string,
): ConnectJourneyState {
  const now = new Date().toISOString();
  const step = CONNECT_JOURNEY_STEPS.find((s) => s.id === phase);
  return {
    phase,
    detail: detail ?? step?.hint ?? state.detail,
    startedAt: state.startedAt ?? (phase === 'awaiting_wallet' ? now : state.startedAt),
    updatedAt: now,
  };
}

/** Index into CONNECT_JOURNEY_STEPS for progress UI (−1 for error). */
export function journeyStepIndex(phase: ConnectJourneyPhase): number {
  if (phase === 'error') return -1;
  return CONNECT_JOURNEY_STEPS.findIndex((s) => s.id === phase);
}
