import { products, type MockProduct } from '@/lib/mock/products';
import { z } from 'zod';

export type DeliveryMethod = 'inside-dhaka' | 'outside-dhaka';
export type PricingLineInput = {
  productId: string;
  quantity: number;
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
  if (!variantLabel) return product.stock;
  const selections = new Map(
    variantLabel.split(' · ').map((part) => {
      const separator = part.indexOf(': ');
      return separator < 0 ? ['', ''] : [part.slice(0, separator), part.slice(separator + 2)];
    }),
  );
  const selectedStocks = product.variants.map((variant) => {
    const selected = selections.get(variant.name);
    return variant.options.find((option) => option.value === selected)?.stock ?? 0;
  });
  return selectedStocks.length ? Math.min(product.stock, ...selectedStocks) : product.stock;
}

export function getPricingQuote(
  lines: PricingLineInput[],
  rawCouponCode: string,
  deliveryMethod: DeliveryMethod,
): PricingQuote {
  const items = lines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    if (!product || !Number.isInteger(line.quantity) || line.quantity <= 0) return [];
    const stock = resolveVariantStock(product, line.variantLabel ?? '');
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
        lineTotal: product.price * quantity,
      },
    ];
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const couponResult = couponCodeSchema.safeParse(rawCouponCode);
  const couponCode = couponResult.success ? couponResult.data : '';
  let discount = 0;
  let couponError = couponResult.success ? '' : 'কুপন কোড ২০ অক্ষরের মধ্যে লিখুন।';
  if (couponCode === 'HAAT10') discount = Math.min(Math.floor(subtotal * 0.1), 50_000);
  else if (couponCode === 'NEW50') {
    if (subtotal > 50_000) discount = 5_000;
    else couponError = 'NEW50 কুপন পেতে ৳ ৫০০-এর বেশি দামের পণ্য নিন।';
  } else if (couponCode && couponCode !== 'FREESHIP') {
    couponError = 'এই কুপনটি চেনা যাচ্ছে না। আবার দেখে লিখুন।';
  }
  const freeDelivery = couponCode === 'FREESHIP' || subtotal >= FREE_DELIVERY_THRESHOLD;
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
