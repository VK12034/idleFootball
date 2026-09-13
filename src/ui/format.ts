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
