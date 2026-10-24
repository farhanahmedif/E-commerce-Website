import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductListing } from '@/components/listing/ProductListing';
import { getCategoryBySlug, getProducts } from '@/lib/mock/products';
import { readProductFilters, searchString } from '@/lib/mock/query';
import { Container } from '@/components/ui/Container';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateStaticParams() {
  const { categories } = await import('@/lib/mock/categories');
  return categories.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'দোকান পাওয়া যায়নি | হাটGo' };
  return {
    title: `${category.nameBn} | হাটGo`,
    description: `${category.nameBn} দোকানের বাছাই করা পসরা ঘুরে দেখুন। ${category.note}`,
    openGraph: {
      title: `${category.nameBn} দোকান | হাটGo`,
      description: category.note,
      type: 'website',
    },
  };
}
export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const query = await searchParams;
  const filters = { ...readProductFilters(query), category: slug };
  const items = await getProducts(filters);
  return (
    <>
      <Container>
        <div
          className="category-banner"
          style={{ '--shop-color': category.color } as React.CSSProperties}
        >
          <span className="category-banner-stamp">দোকান খোলা</span>
          <p>{category.nameEn} • হাটGo</p>
          <strong>{category.nameBn}</strong>
          <span>{category.note}</span>
        </div>
      </Container>
      <ProductListing
        breadcrumbs={[
          { label: 'হোম', href: '/' },
          { label: 'সব পণ্য', href: '/products' },
          { label: category.nameBn },
        ]}
        description={`${category.nameBn} দোকানের স্থানীয় বিক্রেতা ও কারিগরের বাছাই করা পণ্য।`}
        filters={filters}
        items={items}
        pathname={`/category/${slug}`}
        search={searchString(query)}
        title={`${category.nameBn} দোকান`}
      />
    </>
  );
}
