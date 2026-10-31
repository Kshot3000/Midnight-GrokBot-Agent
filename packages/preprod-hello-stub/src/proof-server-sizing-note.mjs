/**
 * Lab note for proof-server sizing facts from official docs only.
 * Upstream: midnightntwrk/midnight-docs#1634
 * Does not invent measurements or APIs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const PROOF_SERVER_SIZING = {
  source: 'https://docs.midnight.network/guides/local-proving',
  defaultWorkers: 2,
  exampleMemoryGiBForK17: 1.5,
  platforms: ['linux/amd64', 'linux/arm64'],
  imageTagInDocs: '8.1.3',
  pinnedLab: '8.1.0',
  note: 'Memory and time grow with circuit size (k). Time your own circuits; the proof server logs request duration.',
};

export function describeSizing() {
  return (
    `Default workers ${PROOF_SERVER_SIZING.defaultWorkers}; ` +
    `one measured circuit (k=17) used ~${PROOF_SERVER_SIZING.exampleMemoryGiBForK17} GiB. ` +
    `Image platforms: ${PROOF_SERVER_SIZING.platforms.join(', ')}.`
  );
}
