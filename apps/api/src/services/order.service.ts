import { randomInt } from 'node:crypto';
import { prisma } from '../lib/prisma';
import type { CreateOrderInput } from '../validators/order.validators';
import { DatabaseUnavailableError } from './database.service';

const DELIVERY_CHARGE = { 'inside-dhaka': 6_000, 'outside-dhaka': 12_000 } as const;
const FREE_DELIVERY_THRESHOLD = 150_000;

export class OrderServiceError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'OrderServiceError';
  }
}

function requireDatabase() {
  if (!prisma) throw new DatabaseUnavailableError();
  return prisma;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s()-]/g, '').replace(/^\+880/, '0');
}

function makeOrderNumber(year: number): string {
  return `HG-${year}-${String(randomInt(0, 1_000_000)).padStart(6, '0')}`;
}

export async function createOrder(input: CreateOrderInput) {
  const database = requireDatabase();
  const now = new Date();

  return database.$transaction(async (transaction) => {
    const products = await transaction.product.findMany({
      where: { slug: { in: input.items.map((item) => item.productSlug) }, isActive: true },
      include: {
        variants: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });
    const productsBySlug = new Map(products.map((product) => [product.slug, product]));
    const orderItems: {
      productId: string;
      productNameBn: string;
      productNameEn: string;
      productSlug: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
      variantSnapshot: string | null;
    }[] = [];

    for (const line of input.items) {
      const product = productsBySlug.get(line.productSlug);
      if (!product) {
        throw new OrderServiceError(
          404,
          'PRODUCT_UNAVAILABLE',
          'A product in this cart is unavailable.',
        );
      }

      const productStockChanged = await transaction.product.updateMany({
        where: { id: product.id, stock: { gte: line.quantity }, isActive: true },
        data: { stock: { decrement: line.quantity } },
      });
      if (productStockChanged.count !== 1) {
        throw new OrderServiceError(409, 'INSUFFICIENT_STOCK', 'A product has insufficient stock.');
      }

      let unitPrice = product.price;
      let variantSnapshot: string | null = null;
      if (product.variants.length > 0) {
        const variant = line.variantSku
          ? product.variants.find((candidate) => candidate.sku === line.variantSku)
          : undefined;
        if (!variant) {
          throw new OrderServiceError(400, 'INVALID_VARIANT', 'Choose a valid product variant.');
        }
        const changed = await transaction.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (changed.count !== 1) {
          throw new OrderServiceError(
            409,
            'INSUFFICIENT_STOCK',
            'A product variant has insufficient stock.',
          );
        }
        unitPrice = variant.priceOverride ?? product.price;
        variantSnapshot = JSON.stringify({
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
        });
      } else {
        if (line.variantSku) {
          throw new OrderServiceError(
            400,
            'INVALID_VARIANT',
            'This product has no selectable variants.',
          );
        }
      }

      const lineTotal = unitPrice * line.quantity;
      if (!Number.isSafeInteger(lineTotal)) {
        throw new OrderServiceError(
          400,
          'INVALID_ORDER_TOTAL',
          'The requested order total is invalid.',
        );
      }
      orderItems.push({
        productId: product.id,
        productNameBn: product.nameBn,
        productNameEn: product.nameEn,
        productSlug: product.slug,
        unitPrice,
        quantity: line.quantity,
        lineTotal,
        variantSnapshot,
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    if (!Number.isSafeInteger(subtotal) || subtotal <= 0) {
      throw new OrderServiceError(
        400,
        'INVALID_ORDER_TOTAL',
        'The requested order total is invalid.',
      );
    }

    let discount = 0;
    let freeDelivery = false;
    if (input.couponCode) {
      const coupon = await transaction.coupon.findUnique({ where: { code: input.couponCode } });
      if (
        !coupon ||
        !coupon.isActive ||
        (coupon.startsAt && coupon.startsAt > now) ||
        (coupon.expiresAt && coupon.expiresAt < now) ||
        subtotal < coupon.minSubtotal ||
        (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
      ) {
        throw new OrderServiceError(
          400,
          'INVALID_COUPON',
          'This coupon is invalid or no longer available.',
        );
      }
      if (coupon.type === 'PERCENTAGE') {
        discount = Math.min(subtotal, Math.floor((subtotal * coupon.value) / 100));
        if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
      } else if (coupon.type === 'FIXED_AMOUNT') {
        discount = Math.min(subtotal, coupon.value);
      } else {
        freeDelivery = true;
      }

      const updated = await transaction.coupon.updateMany({
        where: {
          id: coupon.id,
          isActive: true,
          ...(coupon.usageLimit !== null
            ? { usedCount: coupon.usedCount, usageLimit: { gt: coupon.usedCount } }
            : {}),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (updated.count !== 1) {
        throw new OrderServiceError(
          409,
          'COUPON_UNAVAILABLE',
          'This coupon was just used by another order.',
        );
      }
    }

    const deliveryCharge =
      freeDelivery || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE[input.deliveryZone];
    const total = subtotal - discount + deliveryCharge;
    if (!Number.isSafeInteger(total)) {
      throw new OrderServiceError(
        400,
        'INVALID_ORDER_TOTAL',
        'The requested order total is invalid.',
      );
    }
    let orderNumber = makeOrderNumber(now.getFullYear());
    let orderNumberAvailable = false;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const exists = await transaction.order.findUnique({
        where: { orderNumber },
        select: { id: true },
      });
      if (!exists) {
        orderNumberAvailable = true;
        break;
      }
      orderNumber = makeOrderNumber(now.getFullYear());
    }
    if (!orderNumberAvailable) {
      throw new OrderServiceError(
        503,
        'ORDER_NUMBER_UNAVAILABLE',
        'Unable to allocate an order number. Try again.',
      );
    }

    return transaction.order.create({
      data: {
        orderNumber,
        paymentMethod: 'COD',
        deliveryZone: input.deliveryZone === 'inside-dhaka' ? 'INSIDE_DHAKA' : 'OUTSIDE_DHAKA',
        subtotal,
        discount,
        deliveryCharge,
        total,
        couponCode: input.couponCode,
        recipientName: input.customerName,
        recipientPhone: input.phone,
        recipientEmail: input.email || null,
        division: input.division,
        district: input.district,
        upazila: input.upazila,
        addressLine: input.address,
        note: input.note,
        items: { create: orderItems },
      },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveryZone: true,
        subtotal: true,
        discount: true,
        deliveryCharge: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            productNameBn: true,
            productNameEn: true,
            productSlug: true,
            unitPrice: true,
            quantity: true,
            lineTotal: true,
            variantSnapshot: true,
          },
        },
      },
    });
  });
}

export async function findOrderForTracking(orderNumber: string, phone: string) {
  const database = requireDatabase();
  const order = await database.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      createdAt: true,
      recipientPhone: true,
      items: {
        select: { productNameBn: true, productSlug: true, quantity: true, lineTotal: true },
      },
    },
  });
  if (!order || normalizePhone(order.recipientPhone) !== normalizePhone(phone)) return null;
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items,
  };
}
