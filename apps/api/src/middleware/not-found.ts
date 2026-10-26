import type { Request, Response } from 'express';
import { sendError } from '../lib/response';

export function notFoundHandler(request: Request, response: Response): void {
  sendError(response, 404, 'NOT_FOUND', `Route ${request.method} ${request.path} was not found.`);
}
