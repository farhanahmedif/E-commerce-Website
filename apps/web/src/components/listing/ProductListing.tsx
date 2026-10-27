import Link from 'next/link';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { ProductCard } from '@/components/product/ProductCard';
import { Container } from '@/components/ui/Container';
import { ListingControls } from './ListingControls';
import { products as allProducts, type MockProduct } from '@/lib/mock/products';
import { categories } from '@/lib/mock/categories';

type Filters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  size?: string;
  color?: string;
  inStock?: boolean;
  onSale?: boolean;
  sort?: string;
};
type Chip = { key: string; label: string; value?: string };
function queryWithout(search: string, remove: string) {
  const params = new URLSearchParams(search);
  params.delete(remove);
  params.delete('page');
  const suffix = params.toString();
  return suffix ? `?${suffix}` : '';
}

export function ProductListing({
  title,
  description,
  pathname,
  items,
  breadcrumbs,
  filters,
  search = '',
}: {
  title: string;
  description: string;
  pathname: string;
  items: MockProduct[];
  breadcrumbs: BreadcrumbItem[];
  filters: Filters;
  search?: string;
}) {
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const requestedPage = Number(new URLSearchParams(search).get('page') ?? 1);
  const page = Number.isSafeInteger(requestedPage)
    ? Math.min(pageCount, Math.max(1, requestedPage))
    : 1;
  const currentItems = items.slice((page - 1) * pageSize, page * pageSize);
  const selected = new URLSearchParams(search);
  const chips: Chip[] = [];
  if (filters.category) {
    const category = categories.find((item) => item.slug === filters.category);
    if (category) chips.push({ key: 'category', label: `দোকান: ${category.nameBn}` });
  }
  if (filters.minPrice)
    chips.push({ key: 'minPrice', label: `দাম ৳${Math.floor(filters.minPrice / 100)} থেকে` });
  if (filters.maxPrice && filters.maxPrice < 500000)
    chips.push({ key: 'maxPrice', label: `দাম ৳${Math.floor(filters.maxPrice / 100)} পর্যন্ত` });
  if (filters.brand) chips.push({ key: 'brand', label: filters.brand });
  if (filters.rating) chips.push({ key: 'rating', label: `${filters.rating}+ তারা` });
  if (filters.size) chips.push({ key: 'size', label: `সাইজ ${filters.size}` });
  if (filters.color) chips.push({ key: 'color', label: `রং ${filters.color}` });
  if (filters.inStock) chips.push({ key: 'inStock', label: 'স্টকে আছে' });
  if (filters.onSale) chips.push({ key: 'onSale', label: 'অফার' });
  const activeFilters = chips.length > 0;
  return (
    <main className="listing-page">
      <Container>
        <Breadcrumbs items={breadcrumbs} />
        <header className="listing-heading">
          <p className="listing-eyebrow">বাংলার হাটে খুঁজে নিন</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <div className="listing-layout">
          <ListingControls
            action={pathname}
            categories={categories}
            filters={filters}
            products={allProducts}
            categoryLocked={Boolean(filters.category && pathname.startsWith('/category/'))}
          />
          <section aria-label="পণ্য তালিকা" className="listing-results">
            <div className="listing-toolbar">
              <p aria-live="polite" className="result-count">
                {items.length.toLocaleString('bn-BD')}টি পণ্য পাওয়া গেছে
              </p>
              <form action={pathname} className="sort-form">
                <label htmlFor="product-sort">সাজান</label>
                {selected.get('q') ? (
                  <input name="q" type="hidden" value={selected.get('q') ?? ''} />
                ) : null}
                {filters.category ? (
                  <input name="category" type="hidden" value={filters.category} />
                ) : null}
                {[
                  'minPrice',
                  'maxPrice',
                  'brand',
                  'rating',
                  'size',
                  'color',
                  'inStock',
                  'onSale',
                ].map((key) =>
                  selected.has(key) ? (
                    <input key={key} name={key} type="hidden" value={selected.get(key) ?? ''} />
                  ) : null,
                )}
                <select defaultValue={filters.sort ?? 'newest'} id="product-sort" name="sort">
                  <option value="newest">নতুন এসেছে</option>
                  <option value="price-asc">দাম: কম থেকে বেশি</option>
                  <option value="price-desc">দাম: বেশি থেকে কম</option>
                  <option value="popular">জনপ্রিয়তা</option>
                  <option value="rating">সেরা রেটিং</option>
                </select>
                <button className="sort-apply" type="submit">
                  সাজান
                </button>
              </form>
            </div>
            {activeFilters ? (
              <div aria-label="সক্রিয় ফিল্টার" className="active-filter-chips">
                {chips.map((chip) => (
                  <Link
                    className="filter-chip"
                    href={
                      chip.key === 'category' && pathname.startsWith('/category/')
                        ? `/products${queryWithout(search, 'category')}`
                        : `${pathname}${queryWithout(search, chip.key)}`
                    }
                    key={chip.key}
                  >
                    {chip.label}
                    <span aria-hidden="true"> ×</span>
                    <span className="sr-only">ফিল্টার সরান</span>
                  </Link>
                ))}
                <Link className="clear-filters" href={pathname}>
                  সব ফিল্টার মুছুন
                </Link>
              </div>
            ) : null}
            {currentItems.length ? (
              <div className="listing-grid">
                {currentItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="listing-empty">
                <span aria-hidden="true" className="empty-market-mark">
                  ?
                </span>
                <h2>এই পসরা আজ হাটে নেই!</h2>
                <p>অন্য দাম বা পছন্দ দিয়ে খুঁজে দেখুন—হাটে নিশ্চয়ই আপনার মনের মতো কিছু আছে।</p>
                <Link href={pathname}>সব ফিল্টার মুছুন</Link>
              </div>
            )}
            {pageCount > 1 ? (
              <nav aria-label="পণ্য তালিকার পৃষ্ঠা" className="pagination">
                {page > 1 ? (
                  <Link
                    href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(selected), page: String(page - 1) })}`}
                  >
                    আগের পৃষ্ঠা
                  </Link>
                ) : (
                  <span aria-disabled="true">আগের পৃষ্ঠা</span>
                )}
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => {
                  const params = new URLSearchParams(selected);
                  params.set('page', String(number));
                  return (
                    <Link
                      aria-current={number === page ? 'page' : undefined}
                      href={`${pathname}?${params.toString()}`}
                      key={number}
                    >
                      {number.toLocaleString('bn-BD')}
                    </Link>
                  );
                })}
                {page < pageCount ? (
                  <Link
                    href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(selected), page: String(page + 1) })}`}
                  >
                    পরের পৃষ্ঠা
                  </Link>
                ) : (
                  <span aria-disabled="true">পরের পৃষ্ঠা</span>
                )}
              </nav>
            ) : null}
          </section>
        </div>
      </Container>
    </main>
  );
}
