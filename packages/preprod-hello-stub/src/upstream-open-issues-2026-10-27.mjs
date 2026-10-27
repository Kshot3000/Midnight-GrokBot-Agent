/**
 * Open upstream issue numbers recorded on 2026-10-27.
 * Source: midnightntwrk/servicedesk, midnightntwrk/midnight-docs, midnightntwrk/example-hello-world.
 * This module does not call networks or invent APIs. LOCAL-TRUE.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const SERVICEDESK_OPEN = [267, 266, 254, 249, 243, 242, 252, 251, 236, 213, 194, 193, 186, 117, 99, 24];
export const DOCS_OPEN = [1587, 1569, 1564, 1487, 1383, 1381, 1377, 1245, 1092, 902, 834, 831, 285, 63];
export const HELLO_WORLD_OPEN = [41, 13];

export function issueUrl(orgRepo, number) {
  return `https://github.com/midnightntwrk/${orgRepo}/issues/${number}`;
}

export function listOpen(issues, orgRepo) {
  return issues.map((n) => ({ number: n, url: issueUrl(orgRepo, n) }));
}
