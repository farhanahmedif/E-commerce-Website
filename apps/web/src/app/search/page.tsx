import type { Metadata } from 'next';
import { ProductListing } from '@/components/listing/ProductListing';
import { getProducts } from '@/lib/mock/products';
import { readProductFilters, searchString } from '@/lib/mock/query';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const query = await searchParams;
  const filters = readProductFilters(query);
  const label = filters.q ? `“${filters.q}” খোঁজার ফল` : 'পণ্য খুঁজুন';
  return {
    title: `${label} | হাটGo`,
    description: `${label} — বাংলার হাটের বাছাই করা পণ্য।`,
    openGraph: {
      title: `${label} | হাটGo`,
      description: 'হাটGo-তে বাংলায় বা ইংরেজিতে পণ্য খুঁজুন।',
      type: 'website',
    },
  };
}
export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = readProductFilters(params);
  const items = await getProducts(filters);
  return (
    <ProductListing
      breadcrumbs={[{ label: 'হোম', href: '/' }, { label: 'খোঁজার ফল' }]}
      description={
        filters.q
          ? `“${filters.q}” লিখে হাটে যা পাওয়া গেল।`
          : 'বাংলা বা ইংরেজিতে পণ্যের নাম লিখে হাট ঘুরে দেখুন।'
      }
      filters={filters}
      items={items}
      pathname="/search"
      search={searchString(params)}
      title={filters.q ? `“${filters.q}” খুঁজে পাওয়া পণ্য` : 'হাটে কী খুঁজছেন?'}
    />
  );
}
