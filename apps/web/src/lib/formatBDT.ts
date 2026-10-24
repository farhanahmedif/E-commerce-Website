const taka = new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 });

/** Prices are stored as poisha; this formats a whole taka amount. */
export function formatBDT(pricePoisha: number): string {
  return `৳ ${taka.format(Math.round(pricePoisha / 100))}`;
}
