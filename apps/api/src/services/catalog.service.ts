import type { Prisma } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { DatabaseUnavailableError } from './database.service';
import type { ProductListQuery } from '../validators/catalog.validators';

function requireDatabase() {
  if (!prisma) throw new DatabaseUnavailableError();
  return prisma;
}

const categorySelect = {
  id: true,
  nameBn: true,
  nameEn: true,
  slug: true,
  descriptionBn: true,
  descriptionEn: true,
} as const;

const brandSelect = {
  id: true,
  nameBn: true,
  nameEn: true,
  slug: true,
} as const;

const productRelations = {
  category: { select: categorySelect },
  brand: { select: brandSelect },
  images: {
    orderBy: { sortOrder: 'asc' as const },
    select: { id: true, url: true, altBn: true, altEn: true, sortOrder: true },
  },
  variants: {
    orderBy: { sku: 'asc' as const },
    select: { id: true, size: true, color: true, sku: true, stock: true, priceOverride: true },
  },
};

function buildProductWhere(query: ProductListQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };
  const filters: Prisma.ProductWhereInput[] = [];

  if (query.category) filters.push({ category: { is: { slug: query.category } } });
  if (query.brand) filters.push({ brand: { is: { slug: query.brand } } });
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filters.push({
      price: {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      },
    });
  }
  if (query.q) {
    filters.push({
      OR: [
        { nameBn: { contains: query.q, mode: 'insensitive' } },
        { nameEn: { contains: query.q, mode: 'insensitive' } },
        { descriptionBn: { contains: query.q, mode: 'insensitive' } },
        { descriptionEn: { contains: query.q, mode: 'insensitive' } },
      ],
    });
  }
  if (query.size || query.color) {
    filters.push({
      variants: {
        some: {
          ...(query.size ? { size: query.size } : {}),
          ...(query.color ? { color: query.color } : {}),
          ...(query.inStock === 'true' ? { stock: { gt: 0 } } : {}),
        },
      },
    });
  }
  if (query.inStock === 'true') filters.push({ stock: { gt: 0 } });
  if (query.inStock === 'false') filters.push({ stock: 0 });

  if (filters.length) where.AND = filters;
  return where;
}

function productOrderBy(sort: ProductListQuery['sort']): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price-asc':
      return [{ price: 'asc' }, { id: 'asc' }];
    case 'price-desc':
      return [{ price: 'desc' }, { id: 'asc' }];
    case 'popular':
      return [{ reviews: { _count: 'desc' } }, { createdAt: 'desc' }, { id: 'asc' }];
    default:
      return [{ createdAt: 'desc' }, { id: 'asc' }];
  }
}

async function getReviewAggregates(productIds: string[]) {
  if (productIds.length === 0) return new Map<string, { average: number | null; count: number }>();
  const database = requireDatabase();
  const aggregates = await database.review.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(
    aggregates.map((aggregate) => [
      aggregate.productId,
      { average: aggregate._avg.rating, count: aggregate._count._all },
    ]),
  );
}

export async function listCategories() {
  const database = requireDatabase();
  const categories = await database.category.findMany({
    orderBy: [{ nameBn: 'asc' }, { id: 'asc' }],
    select: {
      ...categorySelect,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
  return categories.map(({ _count, ...category }) => ({
    ...category,
    productCount: _count.products,
  }));
}

export async function listProducts(query: ProductListQuery) {
  const database = requireDatabase();
  const where = buildProductWhere(query);
  const skip = (query.page - 1) * query.limit;
  const [total, products] = await Promise.all([
    database.product.count({ where }),
    database.product.findMany({
      where,
      orderBy: productOrderBy(query.sort),
      skip,
      take: query.limit,
      select: {
        id: true,
        nameBn: true,
        nameEn: true,
        slug: true,
        price: true,
        stock: true,
        createdAt: true,
        category: { select: categorySelect },
        brand: { select: brandSelect },
        images: productRelations.images,
        variants: productRelations.variants,
      },
    }),
  ]);
  const reviews = await getReviewAggregates(products.map((product) => product.id));
  return {
    items: products.map((product) => ({
      ...product,
      rating: reviews.get(product.id)?.average ?? null,
      reviewCount: reviews.get(product.id)?.count ?? 0,
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getProductBySlug(slug: string) {
  const database = requireDatabase();
  const product = await database.product.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      nameBn: true,
      nameEn: true,
      slug: true,
      descriptionBn: true,
      descriptionEn: true,
      price: true,
      stock: true,
      createdAt: true,
      category: { select: categorySelect },
      brand: { select: brandSelect },
      images: productRelations.images,
      variants: productRelations.variants,
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });
  if (!product) return null;
  const reviews = await getReviewAggregates([product.id]);
  return {
    ...product,
    rating: reviews.get(product.id)?.average ?? null,
    reviewCount: reviews.get(product.id)?.count ?? 0,
  };
}
