import type { ProductFilters } from './products';

export function readProductFilters(
  params: Record<string, string | string[] | undefined>,
): ProductFilters {
  const value = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]);
  const amount = (key: string) => {
    const parsed = Number(value(key));
    return value(key) && Number.isFinite(parsed) && parsed >= 0
      ? Math.round(parsed * 100)
      : undefined;
  };
  const rating = Number(value('rating'));
  return {
    category: value('category') || undefined,
    q: value('q')?.trim() || undefined,
    minPrice: amount('minPrice'),
    maxPrice: amount('maxPrice'),
    brand: value('brand') || undefined,
    rating: rating === 3 || rating === 4 ? rating : undefined,
    size: value('size') || undefined,
    color: value('color') || undefined,
    inStock: value('inStock') === 'true',
    onSale: value('onSale') === 'true',
    sort: value('sort') || 'newest',
  };
}

export function searchString(params: Record<string, string | string[] | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value !== undefined) query.set(key, value);
  }
  return query.toString();
}
