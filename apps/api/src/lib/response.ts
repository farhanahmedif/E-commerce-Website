import type { Response } from 'express';

export type ApiError = {
  code: string;
  message: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: Record<string, unknown> | null;
};

export function sendSuccess<T>(
  response: Response,
  data: T,
  statusCode = 200,
  meta: Record<string, unknown> | null = null,
): void {
  const body: ApiEnvelope<T> = { success: true, data, error: null, meta };
  response.status(statusCode).json(body);
}

export function sendError(
  response: Response,
  statusCode: number,
  code: string,
  message: string,
): void {
  const body: ApiEnvelope<never> = {
    success: false,
    data: null,
    error: { code, message },
    meta: null,
  };
  response.status(statusCode).json(body);
}
