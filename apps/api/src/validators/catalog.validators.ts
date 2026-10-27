import { z } from 'zod';

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optionalText = (schema: z.ZodString) =>
  z.preprocess(
    (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    schema.optional(),
  );
const optionalPoisha = z.preprocess(
  (value: unknown) => (value === '' ? undefined : value),
  z.coerce.number().int().safe().nonnegative().optional(),
);

export const productListQuerySchema = z
  .object({
    q: optionalText(z.string().trim().min(1).max(100)),
    category: optionalText(slugSchema),
    brand: optionalText(slugSchema),
    minPrice: optionalPoisha,
    maxPrice: optionalPoisha,
    size: optionalText(z.string().trim().min(1).max(60)),
    color: optionalText(z.string().trim().min(1).max(60)),
    inStock: z.enum(['true', 'false']).optional(),
    sort: z.enum(['newest', 'price-asc', 'price-desc', 'popular']).default('newest'),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    limit: z.coerce.number().int().min(1).max(48).default(12),
  })
  .strict()
  .superRefine((query, context) => {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      context.addIssue({
        code: 'custom',
        path: ['maxPrice'],
        message: 'maxPrice must be greater than or equal to minPrice.',
      });
    }
  });

export const productSlugSchema = slugSchema;

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
