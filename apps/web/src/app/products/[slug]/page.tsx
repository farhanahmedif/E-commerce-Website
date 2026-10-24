import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { getProductBySlug, getRelatedProducts, products } from '@/lib/mock/products';

type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'পণ্য পাওয়া যায়নি | হাটGo' };
  return {
    title: `${product.nameBn} | হাটGo`,
    description: product.description.bn,
    openGraph: {
      title: `${product.nameBn} | হাটGo`,
      description: product.description.bn,
      type: 'website',
    },
  };
}
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);
  const schemaImages = product.images.map(
    (_, index) =>
      `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450"><rect width="600" height="450" fill="${['#d18c55', '#e6c98f', '#668c68'][index]}"/><text x="50%" y="52%" text-anchor="middle" font-size="48" fill="#0f5132">${product.nameBn}</text></svg>`)}`,
  );
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nameBn,
    image: schemaImages,
    description: product.description.bn,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: (product.price / 100).toFixed(2),
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
        type="application/ld+json"
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
