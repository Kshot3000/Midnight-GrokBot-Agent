/**
 * Display helpers — never invent wallet data; only format strings for UI.
 */

/** Middle-truncate an address / key for display. Keeps start + end readable. */
export function formatAddress(
  value: string | null | undefined,
  opts: { head?: number; tail?: number; placeholder?: string } = {},
): string {
  const placeholder = opts.placeholder ?? '(unavailable)';
  if (value == null || value === '') return placeholder;
  const head = opts.head ?? 10;
  const tail = opts.tail ?? 8;
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Short preview of an injection UUID key. */
export function formatInjectionKey(key: string, head = 8): string {
  if (!key) return '(none)';
  if (key.length <= head + 1) return key;
  return `${key.slice(0, head)}…`;
}

/** ISO timestamp → local short time for logs / matrix. */
export function formatProbeTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
