import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { requestLogger } from './middleware/request-logger';
import { catalogRouter } from './routes/catalog.routes';
import { healthRouter } from './routes/health.routes';
import { orderRouter } from './routes/order.routes';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(requestLogger);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: '100kb' }));

app.use('/api/health', healthRouter);
app.use('/api', catalogRouter);
app.use('/api', orderRouter);
app.use(notFoundHandler);
app.use(errorHandler);
