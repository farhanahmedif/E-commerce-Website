import { Router } from 'express';
import { getCategories, getProduct, getProducts } from '../controllers/catalog.controller';

export const catalogRouter = Router();

catalogRouter.get('/categories', getCategories);
catalogRouter.get('/products', getProducts);
catalogRouter.get('/products/:slug', getProduct);
