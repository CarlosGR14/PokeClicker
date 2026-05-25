// Formatea dinero con separadores de miles - funciona igual en servidor y cliente
export function formatMoney(value: number): string {
  return Math.floor(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
