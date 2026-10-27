import type { ErrorRequestHandler } from 'express';
import { sendError } from '../lib/response';
import { DatabaseUnavailableError } from '../services/database.service';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  void _next;

  if (error instanceof DatabaseUnavailableError) {
    sendError(response, 503, 'DATABASE_UNAVAILABLE', 'The database is not configured.');
    return;
  }

  const databaseCode =
    error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : '';
  if (
    (error instanceof Error && error.name === 'PrismaClientInitializationError') ||
    ['P1000', 'P1001', 'P1002', 'P1017', 'P2021', 'P2022', 'P2028'].includes(databaseCode)
  ) {
    console.error(
      'Database request failed with code:',
      databaseCode || (error instanceof Error ? error.name : 'unknown'),
    );
    sendError(
      response,
      503,
      'DATABASE_UNAVAILABLE',
      'The database is unreachable or its migrations have not been applied.',
    );
    return;
  }

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
