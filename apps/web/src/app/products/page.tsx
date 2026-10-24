import type { Metadata } from 'next';
import { ProductListing } from '@/components/listing/ProductListing';
import { getProducts } from '@/lib/mock/products';
import { readProductFilters, searchString } from '@/lib/mock/query';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export const metadata: Metadata = {
  title: 'সব পণ্য | হাটGo',
  description: 'বাংলার হাটের ২৪টি বাছাই করা পণ্য ঘুরে দেখুন।',
  openGraph: {
    title: 'সব পণ্য | হাটGo',
    description: 'বাংলার কারিগর, দোকান আর বাজারের পসরা।',
    type: 'website',
  },
};

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = readProductFilters(params);
  const items = await getProducts(filters);
  return (
    <ProductListing
      breadcrumbs={[{ label: 'হোম', href: '/' }, { label: 'সব পণ্য' }]}
      description="বাংলার আট দোকানের বাছাই করা পসরা—দাম ও পছন্দ মিলিয়ে খুঁজে নিন।"
      filters={filters}
      items={items}
      pathname="/products"
      search={searchString(params)}
      title="সব পণ্যের হাট"
    />
  );
}
