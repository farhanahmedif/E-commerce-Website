import type { Request, Response } from 'express';
import { checkDatabase } from '../services/database.service';
import { sendSuccess } from '../lib/response';

export async function getHealth(_request: Request, response: Response): Promise<void> {
  const database = await checkDatabase();
  const status = database.status === 'connected' ? 'ok' : 'degraded';

  sendSuccess(response, { status, database }, 200, { checkedAt: new Date().toISOString() });
}
