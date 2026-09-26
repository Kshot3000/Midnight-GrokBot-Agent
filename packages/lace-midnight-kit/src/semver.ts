/**
 * Minimal semver helpers — no extra dependency.
 * Enough to filter InitialAPI.apiVersion against a caret range like `^4.0.0`.
 */

export type SemVer = { major: number; minor: number; patch: number };

export function parseSemVer(raw: string): SemVer | null {
  const cleaned = raw.trim().replace(/^v/i, '');
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(cleaned);
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
  };
}

/**
 * Satisfies a simple caret (`^x.y.z`) or exact (`x.y.z`) range.
 * Caret: same major, and >= the given minor.patch (semver caret for major>=1).
 */
export function semverSatisfies(version: string, range: string): boolean {
  const v = parseSemVer(version);
  if (!v) return false;

  const trimmed = range.trim();
  if (trimmed.startsWith('^')) {
    const base = parseSemVer(trimmed.slice(1));
    if (!base) return false;
    if (v.major !== base.major) return false;
    if (v.minor > base.minor) return true;
    if (v.minor < base.minor) return false;
    return v.patch >= base.patch;
  }

  const exact = parseSemVer(trimmed);
  if (!exact) return false;
  return (
    v.major === exact.major &&
    v.minor === exact.minor &&
    v.patch === exact.patch
  );
}
