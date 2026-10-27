import type { Request, Response } from 'express';
import { sendError, sendSuccess } from '../lib/response';
import { findOrderForTracking, OrderServiceError, createOrder } from '../services/order.service';
import { createOrderSchema, trackOrderSchema } from '../validators/order.validators';

export async function postOrder(request: Request, response: Response): Promise<void> {
  const parsed = createOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    sendError(
      response,
      400,
      'INVALID_ORDER',
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
    );
    return;
  }
  try {
    const order = await createOrder(parsed.data);
    sendSuccess(response, order, 201);
  } catch (error: unknown) {
    if (error instanceof OrderServiceError) {
      sendError(response, error.statusCode, error.code, error.message);
      return;
    }
    throw error;
  }
}

export async function getTrackedOrder(request: Request, response: Response): Promise<void> {
  const parsed = trackOrderSchema.safeParse({
    ...request.query,
    orderNumber: request.params.orderNumber,
  });
  if (!parsed.success) {
    sendError(
      response,
      400,
      'INVALID_TRACKING_DETAILS',
      'A valid Bangladesh phone number is required.',
    );
    return;
  }
  try {
    const order = await findOrderForTracking(parsed.data.orderNumber, parsed.data.phone);
    if (!order) {
      sendError(response, 404, 'ORDER_NOT_FOUND', 'No order matches those tracking details.');
      return;
    }
    sendSuccess(response, order);
  } catch (error: unknown) {
    if (error instanceof OrderServiceError) {
      sendError(response, error.statusCode, error.code, error.message);
      return;
    }
    throw error;
  }
}
