import type { ErrorRequestHandler } from 'express';
import { sendError } from '../lib/response';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  void _next;

  if (error instanceof Error && 'type' in error && error.type === 'entity.too.large') {
    sendError(response, 413, 'PAYLOAD_TOO_LARGE', 'The request body exceeds the 100 KB limit.');
    return;
  }

  if (error instanceof Error && 'type' in error && error.type === 'entity.parse.failed') {
    sendError(response, 400, 'INVALID_JSON', 'The request body must contain valid JSON.');
    return;
  }

  console.error('Unhandled API error:', error);
  sendError(response, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected server error occurred.');
};
