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
});

export type MockOrder = z.infer<typeof orderSchema>;
export type NewMockOrder = Omit<MockOrder, 'id' | 'status' | 'createdAt' | 'items'> & {
  items: PricedLine[];
};

const ORDERS_KEY = 'haatgo-orders-v1';

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

export async function saveOrder(input: NewMockOrder): Promise<MockOrder> {
  const existing = readOrders();
  const now = new Date();
  const sequence = String(now.getTime() % 1_000_000).padStart(6, '0');
  const order = orderSchema.parse({
    ...input,
    id: `HG-${now.getFullYear()}-${sequence}`,
    status: 'pending',
    createdAt: now.toISOString(),
  });
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...existing]));
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

export function getDemoOrderStatus(order: MockOrder): OrderStatus {
  const ageInHours = Math.max(0, (Date.now() - Date.parse(order.createdAt)) / 3_600_000);
  if (ageInHours >= 48) return 'delivered';
  if (ageInHours >= 12) return 'shipped';
  if (ageInHours >= 1) return 'confirmed';
  return 'pending';
}

export function getDeliveryEstimate(deliveryMethod: DeliveryMethod): string {
  return deliveryMethod === 'inside-dhaka' ? '১ থেকে ২ দিনের মধ্যে' : '৩ থেকে ৫ দিনের মধ্যে';
}
