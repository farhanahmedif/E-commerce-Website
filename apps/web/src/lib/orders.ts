import { z } from 'zod';
import type { DeliveryMethod, PricedLine } from '@/lib/pricing';

export const paymentMethods = ['cod', 'bkash', 'nagad', 'rocket', 'card'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];
export const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered'] as const;
export type OrderStatus = (typeof orderStatuses)[number];

const orderSchema = z.object({
  id: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      slug: z.string(),
      nameBn: z.string(),
      image: z.string(),
      price: z.number().int().nonnegative(),
      quantity: z.number().int().positive(),
      variantLabel: z.string(),
      lineTotal: z.number().int().nonnegative(),
    }),
  ),
  customerName: z.string(),
  phone: z.string(),
  email: z.string(),
  division: z.string(),
  district: z.string(),
  upazila: z.string(),
  address: z.string(),
  orderNote: z.string(),
  deliveryMethod: z.enum(['inside-dhaka', 'outside-dhaka']),
  paymentMethod: z.enum(paymentMethods),
  paymentSenderPhone: z.string(),
  transactionId: z.string(),
  couponCode: z.string(),
  subtotal: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative(),
  deliveryCharge: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  status: z.enum(orderStatuses),
  createdAt: z.string().datetime(),
  source: z.enum(['demo', 'backend']).optional(),
});

export type MockOrder = z.infer<typeof orderSchema>;
export type NewMockOrder = Omit<MockOrder, 'id' | 'status' | 'createdAt' | 'items'> & {
  items: PricedLine[];
};

const ORDERS_KEY = 'haatgo-orders-v1';
const apiOrderSchema = z.object({
  orderNumber: z.string().regex(/^HG-\d{4}-\d{6}$/),
  status: z.literal('PENDING'),
  paymentMethod: z.literal('COD'),
  deliveryZone: z.enum(['INSIDE_DHAKA', 'OUTSIDE_DHAKA']),
  subtotal: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative(),
  deliveryCharge: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  items: z.array(
    z.object({
      productNameBn: z.string(),
      productNameEn: z.string(),
      productSlug: z.string(),
      unitPrice: z.number().int().nonnegative(),
      quantity: z.number().int().positive(),
      lineTotal: z.number().int().nonnegative(),
      variantSnapshot: z.string().nullable(),
    }),
  ),
});
const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }),
});

function readOrders(): MockOrder[] {
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const result = z.array(orderSchema).safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function persistOrder(order: MockOrder): void {
  const existing = readOrders().filter((saved) => saved.id !== order.id);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...existing]));
}

export async function createBackendOrder(input: NewMockOrder): Promise<MockOrder> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  let response: Response;
  try {
    response = await fetch(new URL('/api/orders', apiUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: input.items.map((item) => ({
          productSlug: item.slug,
          ...(item.variantSku ? { variantSku: item.variantSku } : {}),
          quantity: item.quantity,
        })),
        customerName: input.customerName,
        phone: input.phone,
        email: input.email,
        division: input.division,
        district: input.district,
        upazila: input.upazila,
        address: input.address,
        note: input.orderNote,
        deliveryZone: input.deliveryMethod,
        paymentMethod: 'cod',
        ...(input.couponCode ? { couponCode: input.couponCode } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error('Backend-এ সংযোগ করা যায়নি। API server চালু আছে কি না দেখুন।');
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const apiError = apiErrorSchema.safeParse(body);
    const code = apiError.success ? apiError.data.error.code : '';
    const message =
      code === 'DATABASE_UNAVAILABLE'
        ? 'Backend database সংযুক্ত নেই। Database চালু করে আবার চেষ্টা করুন।'
        : code === 'PRODUCT_UNAVAILABLE'
          ? 'Cart-এর একটি পণ্য আর পাওয়া যাচ্ছে না। পণ্যগুলো আবার যাচাই করুন।'
          : code === 'INSUFFICIENT_STOCK'
            ? 'Cart-এর একটি পণ্যের stock শেষ বা কমে গেছে। Cart হালনাগাদ করে আবার চেষ্টা করুন।'
            : code === 'INVALID_VARIANT'
              ? 'Cart-এর একটি variant আর পাওয়া যাচ্ছে না। Variant বেছে আবার চেষ্টা করুন।'
              : code === 'INVALID_COUPON'
                ? 'এই coupon code backend-এ গ্রহণ করা হয়নি। Coupon সরিয়ে আবার চেষ্টা করুন।'
                : apiError.success
                  ? apiError.data.error.message
                  : 'Backend order তৈরি করতে পারেনি। আবার চেষ্টা করুন।';
    throw new Error(message);
  }

  const envelope = z.object({ success: z.literal(true), data: apiOrderSchema }).safeParse(body);
  if (!envelope.success)
    throw new Error('Backend-এর order response সঠিক নয়। Order সংরক্ষিত কি না যাচাই করুন।');
  const remoteOrder = envelope.data.data;
  const localItems = new Map(
    input.items.map((item) => [`${item.slug}:${item.variantSku ?? ''}`, item]),
  );
  const order = orderSchema.parse({
    id: remoteOrder.orderNumber,
    items: remoteOrder.items.map((item) => {
      let parsedSnapshot: unknown = null;
      if (item.variantSnapshot) {
        try {
          parsedSnapshot = JSON.parse(item.variantSnapshot);
        } catch {
          parsedSnapshot = null;
        }
      }
      const snapshot = z.object({ sku: z.string().optional() }).safeParse(parsedSnapshot);
      const variantSku = snapshot.success ? (snapshot.data.sku ?? '') : '';
      const localItem = localItems.get(`${item.productSlug}:${variantSku}`);
      return {
        productId: localItem?.productId ?? item.productSlug,
        slug: item.productSlug,
        nameBn: item.productNameBn,
        image: localItem?.image ?? 'woven',
        price: item.unitPrice,
        quantity: item.quantity,
        variantLabel: localItem?.variantLabel ?? '',
        lineTotal: item.lineTotal,
      };
    }),
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    division: input.division,
    district: input.district,
    upazila: input.upazila,
    address: input.address,
    orderNote: input.orderNote,
    deliveryMethod: remoteOrder.deliveryZone === 'INSIDE_DHAKA' ? 'inside-dhaka' : 'outside-dhaka',
    paymentMethod: 'cod',
    paymentSenderPhone: '',
    transactionId: '',
    couponCode: input.couponCode,
    subtotal: remoteOrder.subtotal,
    discount: remoteOrder.discount,
    deliveryCharge: remoteOrder.deliveryCharge,
    total: remoteOrder.total,
    status: 'pending',
    createdAt: remoteOrder.createdAt,
    source: 'backend',
  });
  persistOrder(order);
  return order;
}

export async function getOrderById(orderId: string): Promise<MockOrder | undefined> {
  return readOrders().find((order) => order.id.toLowerCase() === orderId.trim().toLowerCase());
}

export async function getOrdersForDevice(): Promise<MockOrder[]> {
  return readOrders();
}

export function normalizeBangladeshPhone(phone: string): string {
  return phone.replace(/[\s()-]/g, '').replace(/^\+880/, '0');
}

export function getOrderStatus(order: MockOrder): OrderStatus {
  return order.status;
}

export function getDeliveryEstimate(deliveryMethod: DeliveryMethod): string {
  return deliveryMethod === 'inside-dhaka' ? '১ থেকে ২ দিনের মধ্যে' : '৩ থেকে ৫ দিনের মধ্যে';
}
