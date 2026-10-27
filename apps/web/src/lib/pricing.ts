import { getVariantStock, products, type MockProduct } from '@/lib/mock/products';
import { z } from 'zod';

export type DeliveryMethod = 'inside-dhaka' | 'outside-dhaka';
export type PricingLineInput = {
  productId: string;
  quantity: number;
  slug?: string;
  nameBn?: string;
  image?: string;
  price?: number;
  stock?: number;
  variantSku?: string;
  isSample?: boolean;
  variantLabel?: string;
};
export type PricedLine = {
  productId: string;
  slug: string;
  nameBn: string;
  image: string;
  price: number;
  quantity: number;
  variantLabel: string;
  variantSku?: string;
  lineTotal: number;
};
export type PricingQuote = {
  items: PricedLine[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode: string;
  couponError: string;
};

export const FREE_DELIVERY_THRESHOLD = 150_000;
export const DELIVERY_CHARGES: Record<DeliveryMethod, number> = {
  'inside-dhaka': 6_000,
  'outside-dhaka': 12_000,
};
const couponCodeSchema = z.string().trim().toUpperCase().max(20);

function resolveVariantStock(product: MockProduct, variantLabel: string): number {
  if (product.variants.length === 0) return variantLabel ? 0 : product.stock;
  if (!variantLabel) return 0;
  const selections = new Map<string, string>();
  for (const part of variantLabel.split(' · ')) {
    const separator = part.indexOf(': ');
    if (separator < 1) return 0;
    const name = part.slice(0, separator);
    if (selections.has(name)) return 0;
    selections.set(name, part.slice(separator + 2));
  }
  if (selections.size !== product.variants.length) return 0;
  return getVariantStock(product, Object.fromEntries(selections));
}

export function getPricingQuote(
  lines: PricingLineInput[],
  rawCouponCode: string,
  deliveryMethod: DeliveryMethod,
): PricingQuote {
  const items = lines.flatMap((line) => {
    const sampleProduct =
      line.isSample === false
        ? undefined
        : products.find(
            (item) => item.id === line.productId && (!line.slug || item.slug === line.slug),
          );
    const product =
      sampleProduct ??
      (line.slug && line.nameBn && line.image && line.price !== undefined
        ? {
            id: line.productId,
            slug: line.slug,
            nameBn: line.nameBn,
            image: line.image,
            price: line.price,
            stock: line.stock ?? 0,
          }
        : undefined);
    if (
      !product ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity <= 0 ||
      !Number.isSafeInteger(product.price * line.quantity)
    )
      return [];
    const stock = sampleProduct
      ? resolveVariantStock(sampleProduct, line.variantLabel ?? '')
      : (line.stock ?? 0);
    const quantity = Math.min(stock, line.quantity);
    if (quantity <= 0) return [];
    return [
      {
        productId: product.id,
        slug: product.slug,
        nameBn: product.nameBn,
        image: product.image,
        price: product.price,
        quantity,
        variantLabel: line.variantLabel ?? '',
        ...(line.variantSku ? { variantSku: line.variantSku } : {}),
        lineTotal: product.price * quantity,
      },
    ];
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const couponResult = couponCodeSchema.safeParse(rawCouponCode);
  const couponCode = couponResult.success ? couponResult.data : '';
  const discount = 0;
  const couponError = couponResult.success ? '' : 'কুপন কোড ২০ অক্ষরের মধ্যে লিখুন।';
  const freeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryCharge = freeDelivery ? 0 : DELIVERY_CHARGES[deliveryMethod];
  return {
    items,
    subtotal,
    discount,
    deliveryCharge,
    total: Math.max(0, subtotal - discount + deliveryCharge),
    couponCode: couponError ? '' : couponCode,
    couponError,
  };
}
