import { z } from 'zod';
import {
  getProducts as getSampleProducts,
  products as sampleProducts,
  type MockProduct,
  type ProductFilters,
} from '@/lib/mock/products';

const imageSchema = z.object({
  url: z.string().url(),
  altBn: z.string().nullable(),
  altEn: z.string().nullable(),
});
const variantSchema = z.object({
  id: z.string(),
  size: z.string().nullable(),
  color: z.string().nullable(),
  sku: z.string(),
  stock: z.number().int().nonnegative(),
  priceOverride: z.number().int().nonnegative().nullable(),
});
const reviewSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.string(),
  user: z.object({ name: z.string() }),
});
const productSchema = z.object({
  id: z.string(),
  nameBn: z.string(),
  nameEn: z.string(),
  slug: z.string(),
  descriptionBn: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  createdAt: z.string(),
  category: z.object({ slug: z.string(), nameBn: z.string(), nameEn: z.string() }),
  brand: z.object({ nameBn: z.string(), nameEn: z.string() }).nullable(),
  images: z.array(imageSchema),
  variants: z.array(variantSchema),
  rating: z.number().min(0).max(5).nullable(),
  reviewCount: z.number().int().nonnegative(),
  reviews: z.array(reviewSchema).optional(),
});
const responseSchema = <T extends z.ZodType>(data: T) =>
  z.object({ success: z.literal(true), data, error: z.null() });
let apiUnavailableUntil = 0;

const imageByCategory: Record<string, string> = {
  beauty: 'oil',
  books: 'book',
  crafts: 'woven',
  electronics: 'wood',
  fashion: 'fabric',
  grocery: 'honey',
  home: 'bamboo',
  toys: 'wood',
};

function mapProduct(value: z.infer<typeof productSchema>): MockProduct {
  const sample = sampleProducts.find((item) => item.slug === value.slug);
  const reviews = (value.reviews ?? []).map((review) => ({
    id: review.id,
    name: review.user.name,
    rating: review.rating,
    date: review.createdAt.slice(0, 10),
    comment: review.comment ?? '',
  }));
  const sizes = new Map<string, number>();
  const colors = new Map<string, { stock: number; color?: string }>();
  for (const variant of value.variants) {
    if (variant.size)
      sizes.set(variant.size, Math.max(sizes.get(variant.size) ?? 0, variant.stock));
    if (variant.color)
      colors.set(variant.color, {
        stock: Math.max(colors.get(variant.color)?.stock ?? 0, variant.stock),
      });
  }
  const variants = [
    ...(sizes.size
      ? [{ name: 'সাইজ', options: [...sizes].map(([value, stock]) => ({ value, stock })) }]
      : []),
    ...(colors.size
      ? [{ name: 'রং', options: [...colors].map(([value, info]) => ({ value, ...info })) }]
      : []),
  ];
  const imageUrls = value.images.map((image) => image.url);
  const variantSkuByLabel: Record<string, string> = {};
  const variantStockByLabel: Record<string, number> = {};
  const variantPriceByLabel: Record<string, number> = {};
  for (const variant of value.variants) {
    const label = [
      ...(variant.size ? [`সাইজ: ${variant.size}`] : []),
      ...(variant.color ? [`রং: ${variant.color}`] : []),
    ].join(' · ');
    variantSkuByLabel[label] = variant.sku;
    variantStockByLabel[label] = variant.stock;
    variantPriceByLabel[label] = variant.priceOverride ?? value.price;
  }
  const price = value.price;
  return {
    id: value.id,
    slug: value.slug,
    nameBn: value.nameBn,
    nameEn: value.nameEn,
    category: value.category.slug,
    price,
    oldPrice: price,
    rating: value.rating ?? 0,
    reviewCount: value.reviewCount,
    stock: value.stock,
    badge: 'হাটের পসরা',
    image: sample?.image ?? imageByCategory[value.category.slug] ?? 'woven',
    imageUrls: imageUrls.length ? imageUrls : undefined,
    images: imageUrls.length ? imageUrls : ['front', 'detail', 'back'],
    brand: value.brand?.nameBn ?? 'স্থানীয় বিক্রেতা',
    description: {
      bn: value.descriptionBn ?? `${value.nameBn} — ${value.category.nameBn} বিভাগের পণ্য।`,
      en: value.descriptionEn ?? `${value.nameEn} from ${value.category.nameEn}.`,
    },
    variants,
    ...(value.variants.length
      ? { variantSkuByLabel, variantStockByLabel, variantPriceByLabel }
      : {}),
    sku: value.variants[0]?.sku ?? value.slug,
    tags: [value.nameBn, value.nameEn, value.category.nameBn, value.category.nameEn],
    createdAt: value.createdAt,
    reviews,
    isSample: false,
  };
}

function catalogApiUrl(): string {
  return process.env.HAATGO_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

async function requestCatalog<T extends z.ZodType>(
  path: string,
  schema: T,
): Promise<{ status: number; data: z.infer<T> | null } | null> {
  if (Date.now() < apiUnavailableUntil) return null;
  try {
    const response = await fetch(new URL(path, catalogApiUrl()), {
      cache: 'no-store',
      signal: AbortSignal.timeout(2_000),
    });
    if (!response.ok) {
      if (response.status >= 500) apiUnavailableUntil = Date.now() + 5_000;
      return { status: response.status, data: null };
    }
    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) {
      apiUnavailableUntil = Date.now() + 5_000;
      return null;
    }
    return { status: response.status, data: parsed.data };
  } catch {
    apiUnavailableUntil = Date.now() + 5_000;
    return null;
  }
}

function toApiQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.inStock) params.set('inStock', 'true');
  if (filters.sort === 'price-asc' || filters.sort === 'price-desc' || filters.sort === 'popular') {
    params.set('sort', filters.sort);
  }
  params.set('limit', '48');
  return params.toString();
}

export async function getCatalogProducts(filters: ProductFilters = {}): Promise<MockProduct[]> {
  const query = toApiQuery(filters);
  const result = await requestCatalog(
    `/api/products?${query}`,
    responseSchema(z.array(productSchema)),
  );
  if (!result?.data?.success) return getSampleProducts(filters);
  let items = result.data.data.map(mapProduct);
  if (filters.brand) items = items.filter((product) => product.brand === filters.brand);
  if (filters.rating) items = items.filter((product) => product.rating >= filters.rating!);
  if (filters.onSale) items = items.filter((product) => product.oldPrice > product.price);
  if (filters.size)
    items = items.filter((product) =>
      product.variants.some((variant) =>
        variant.options.some((option) => option.value === filters.size && option.stock > 0),
      ),
    );
  if (filters.color)
    items = items.filter((product) =>
      product.variants.some(
        (variant) =>
          variant.name === 'রং' &&
          variant.options.some((option) => option.value === filters.color && option.stock > 0),
      ),
    );
  if (filters.sort === 'rating') items.sort((a, b) => b.rating - a.rating);
  return items;
}

export async function getCatalogProduct(slug: string): Promise<MockProduct | undefined> {
  const result = await requestCatalog(
    `/api/products/${encodeURIComponent(slug)}`,
    responseSchema(productSchema),
  );
  if (result?.status === 404) return undefined;
  if (result?.data?.success) return mapProduct(result.data.data);
  return sampleProducts.find((product) => product.slug === slug);
}

export async function getRelatedCatalogProducts(product: MockProduct): Promise<MockProduct[]> {
  const products = await getCatalogProducts({ category: product.category });
  return products.filter((candidate) => candidate.id !== product.id).slice(0, 6);
}
