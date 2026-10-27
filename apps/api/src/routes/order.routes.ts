import { Router } from 'express';
import { getTrackedOrder, postOrder } from '../controllers/order.controller';

export const orderRouter = Router();

orderRouter.post('/orders', postOrder);
orderRouter.get('/orders/:orderNumber', getTrackedOrder);
