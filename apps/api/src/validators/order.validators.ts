import { z } from 'zod';

const orderLineSchema = z
  .object({
    productSlug: z.string().trim().min(1).max(120),
    variantSku: z.string().trim().min(1).max(100).optional(),
    quantity: z.number().int().min(1).max(99),
  })
  .strict();

export const createOrderSchema = z
  .object({
    items: z.array(orderLineSchema).min(1).max(50),
    customerName: z.string().trim().min(2).max(80),
    phone: z
      .string()
      .trim()
      .regex(/^(?:01\d{9}|\+8801\d{9})$/),
    email: z.union([z.literal(''), z.string().trim().email().max(254)]).optional(),
    division: z.string().trim().min(1).max(80),
    district: z.string().trim().min(1).max(80),
    upazila: z.string().trim().min(1).max(100),
    address: z.string().trim().min(8).max(300),
    note: z.string().trim().max(300).optional(),
    deliveryZone: z.enum(['inside-dhaka', 'outside-dhaka']),
    paymentMethod: z.literal('cod'),
    couponCode: z.string().trim().toUpperCase().max(40).optional(),
  })
  .strict()
  .superRefine(({ items }, context) => {
    const itemKeys = new Set<string>();
    for (const [index, item] of items.entries()) {
      const key = `${item.productSlug}:${item.variantSku ?? ''}`;
      if (itemKeys.has(key)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index],
          message: 'Duplicate product variants must be combined into one order line.',
        });
      }
      itemKeys.add(key);
    }
  });

export const trackOrderSchema = z
  .object({
    orderNumber: z
      .string()
      .trim()
      .regex(/^HG-\d{4}-\d{6}$/i),
    phone: z
      .string()
      .trim()
      .regex(/^(?:01\d{9}|\+8801\d{9})$/),
  })
  .strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
