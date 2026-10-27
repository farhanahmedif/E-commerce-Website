import type { Request, Response } from 'express';
import { sendError, sendSuccess } from '../lib/response';
import { getProductBySlug, listCategories, listProducts } from '../services/catalog.service';
import { DatabaseUnavailableError } from '../services/database.service';
import { productListQuerySchema, productSlugSchema } from '../validators/catalog.validators';

function sendCatalogFailure(error: unknown, response: Response): void {
  if (error instanceof DatabaseUnavailableError) {
    sendError(response, 503, 'CATALOG_UNAVAILABLE', 'The catalog database is not configured.');
    return;
  }
  throw error;
}

export async function getCategories(_request: Request, response: Response): Promise<void> {
  try {
    const categories = await listCategories();
    sendSuccess(response, categories, 200, { count: categories.length });
  } catch (error: unknown) {
    sendCatalogFailure(error, response);
  }
}

export async function getProducts(request: Request, response: Response): Promise<void> {
  const parsedQuery = productListQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    sendError(
      response,
      400,
      'INVALID_QUERY',
      parsedQuery.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; '),
    );
    return;
  }
  try {
    const result = await listProducts(parsedQuery.data);
    sendSuccess(response, result.items, 200, { pagination: result.pagination });
  } catch (error: unknown) {
    sendCatalogFailure(error, response);
  }
}

export async function getProduct(request: Request, response: Response): Promise<void> {
  const parsedSlug = productSlugSchema.safeParse(request.params.slug);
  if (!parsedSlug.success) {
    sendError(response, 400, 'INVALID_PRODUCT_SLUG', 'The product slug is invalid.');
    return;
  }
  try {
    const product = await getProductBySlug(parsedSlug.data);
    if (!product) {
      sendError(response, 404, 'PRODUCT_NOT_FOUND', 'The requested product was not found.');
      return;
    }
    sendSuccess(response, product);
  } catch (error: unknown) {
    sendCatalogFailure(error, response);
  }
}
