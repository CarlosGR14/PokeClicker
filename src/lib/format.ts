/**
 * Format a number with thousands separators
 * Consistent across server and client to avoid hydration mismatches
 */
export function formatMoney(value: number): string {
  return Math.floor(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
