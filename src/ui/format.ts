/** Kid-friendly number shortening: 1.2K, 3.4M, 5.6B. */
export function fmt(n: number): string {
  const v = Math.floor(n);
  if (v < 1000) return String(v);
  const units = ['K', 'M', 'B', 'T', 'Qa', 'Qi'];
  let scaled = v;
  let unit = -1;
  while (scaled >= 1000 && unit < units.length - 1) {
    scaled /= 1000;
    unit++;
  }
  return `${scaled < 10 ? scaled.toFixed(1) : Math.floor(scaled)}${units[unit]}`;
}

/** One decimal, for rates like yards per second. */
export function fmtRate(n: number): string {
  if (n < 100) return n.toFixed(1);
  return fmt(n);
}

/**
 * The bank readout. Below six figures it stays a full number with separators,
 * because watching every digit move is the point; past that it shortens.
 */
export function fmtBank(n: number): string {
  const v = Math.floor(n);
  return v < 100_000 ? v.toLocaleString('en-US') : fmt(v);
}

/** "18s" / "2m 40s" — how long until you can afford something. */
export function fmtEta(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m}m` : `${m}m ${rest}s`;
}
