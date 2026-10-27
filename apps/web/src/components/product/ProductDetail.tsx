'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Heart, Minus, Plus, Star, X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import {
  getDefaultVariantSelections,
  getVariantSku,
  getVariantPrice,
  getVariantStock,
  type MockProduct,
  type ProductReview,
} from '@/lib/mock/products';
import { formatBDT } from '@/lib/formatBDT';
import { useShopStore } from '@/lib/store';
import { ProductImage } from './ProductImage';
import { ProductCard } from './ProductCard';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const reviewSchema = z.object({
  name: z.string().trim().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে।'),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(8, 'অভিজ্ঞতা অন্তত ৮ অক্ষরে লিখুন।')
    .max(500, 'লেখাটি ৫০০ অক্ষরের মধ্যে রাখুন।'),
});
const tabs = ['বিস্তারিত', 'বৈশিষ্ট্য', 'ক্রেতার কথা', 'ডেলিভারি ও ফেরত'] as const;

export function ProductDetail({
  product,
  related,
}: {
  product: MockProduct;
  related: MockProduct[];
}) {
  const router = useRouter();
  const [view, setView] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [tab, setTab] = useState<(typeof tabs)[number]>('বিস্তারিত');
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    getDefaultVariantSelections(product),
  );
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>(product.reviews);
  const [reviewMessage, setReviewMessage] = useState('');
  const lightboxRef = useRef<HTMLElement>(null);
  const closeLightboxRef = useRef<HTMLButtonElement>(null);
  const addToCart = useShopStore((state) => state.addToCart);
  const wished = useShopStore((state) => state.wishlist.includes(product.id));
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const availableStock = getVariantStock(product, selected);
  const variantLabel = product.variants
    .map((variant) => `${variant.name}: ${selected[variant.name]}`)
    .join(' · ');
  const variantSku = getVariantSku(product, selected);
  const selectedPrice = getVariantPrice(product, selected);
  const discount =
    product.oldPrice > selectedPrice ? Math.round((1 - selectedPrice / product.oldPrice) * 100) : 0;
  const savings = product.oldPrice - selectedPrice;
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const breakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: reviews.filter((review) => review.rating === rating).length,
      })),
    [reviews],
  );
  useEffect(() => {
    if (!lightbox) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeLightboxRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false);
      if (event.key === 'ArrowRight') setView((current) => (current + 1) % product.images.length);
      if (event.key === 'ArrowLeft')
        setView((current) => (current + product.images.length - 1) % product.images.length);
      if (event.key === 'Tab') {
        event.preventDefault();
        closeLightboxRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [lightbox, product.images.length]);
  function onReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = reviewSchema.safeParse({
      name: data.get('name'),
      rating: data.get('rating'),
      comment: data.get('comment'),
    });
    if (!result.success) {
      setReviewMessage(result.error.issues[0]?.message ?? 'তথ্যগুলো আবার দেখুন।');
      return;
    }
    const newReview: ProductReview = {
      id: `local-${Date.now()}`,
      ...result.data,
      date: new Date().toISOString().slice(0, 10),
    };
    setReviews((current) => [newReview, ...current]);
    setReviewMessage('মতামতটি শুধু এই page-এ অস্থায়ীভাবে যোগ হয়েছে; সংরক্ষিত হয়নি।');
    event.currentTarget.reset();
  }
  function changeView(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowRight') setView((current) => (current + 1) % product.images.length);
    if (event.key === 'ArrowLeft')
      setView((current) => (current + product.images.length - 1) % product.images.length);
  }
  function buyNow() {
    addToCart(product, quantity, variantLabel, availableStock, variantSku, selectedPrice);
    useShopStore.getState().setCartDrawerOpen(false);
    router.push('/checkout');
  }
  const reviewCount = reviews.length;
  return (
    <main className="product-detail-page">
      <Container>
        <Breadcrumbs
          items={[
            { label: 'হোম', href: '/' },
            { label: 'সব পণ্য', href: '/products' },
            { label: product.nameBn },
          ]}
        />
        <div className="product-detail-grid">
          <section aria-label="পণ্যের ছবি" className="gallery" onKeyDown={changeView}>
            <button
              aria-label="ছবি বড় করে দেখুন"
              className="gallery-main"
              onClick={() => setLightbox(true)}
              type="button"
            >
              <ProductImage
                className="detail-art"
                imageUrl={product.imageUrls?.[view] ?? product.imageUrls?.[0]}
                name={product.nameBn}
                variant={product.image}
                view={view}
              />
              <span className="gallery-zoom-hint">ছবি বড় করে দেখুন</span>
            </button>
            <div aria-label="পণ্যের ছবি বেছে নিন" className="gallery-thumbnails" role="group">
              {product.images.map((image, index) => (
                <button
                  aria-label={`${product.nameBn}, ছবি ${index + 1}`}
                  aria-pressed={view === index}
                  className={`gallery-thumbnail ${view === index ? 'selected' : ''}`}
                  key={image}
                  onClick={() => setView(index)}
                  onKeyDown={changeView}
                  type="button"
                >
                  <ProductImage
                    name={`${product.nameBn} ${index + 1}`}
                    imageUrl={product.imageUrls?.[index]}
                    variant={product.image}
                    view={index}
                  />
                </button>
              ))}
            </div>
          </section>
          <section className="product-buy-panel">
            <p className="product-brand">
              {product.brand} <span>• SKU {product.sku}</span>
            </p>
            <h1>{product.nameBn}</h1>
            <p className="product-english-title">{product.nameEn}</p>
            <button
              className="product-rating-link"
              onClick={() => setTab('ক্রেতার কথা')}
              type="button"
            >
              <Star aria-hidden="true" className="size-4 fill-haat-marigold text-haat-marigold" />
              <strong>{average.toFixed(1)}</strong>
              <span>({reviewCount.toLocaleString('bn-BD')}টি মতামত)</span>
            </button>
            <div className="detail-prices">
              <span className="detail-current-price">{formatBDT(selectedPrice)}</span>
              {product.oldPrice > selectedPrice ? (
                <>
                  <span className="detail-old-price">{formatBDT(product.oldPrice)}</span>
                  <span className="discount-stamp">-{discount}% ছাড়</span>
                </>
              ) : null}
            </div>
            {savings > 0 ? <p className="savings-copy">সাশ্রয় {formatBDT(savings)}</p> : null}
            {product.variants.map((variant) => (
              <fieldset className="variant-fieldset" key={variant.name}>
                <legend>
                  {variant.name}: <strong>{selected[variant.name]}</strong>
                </legend>
                <div className="variant-options">
                  {variant.options.map((option) => (
                    <button
                      aria-pressed={selected[variant.name] === option.value}
                      className={`variant-option ${selected[variant.name] === option.value ? 'active' : ''} ${option.stock === 0 ? 'out-of-stock' : ''}`}
                      key={option.value}
                      onClick={() => {
                        setSelected((current) => ({ ...current, [variant.name]: option.value }));
                        setQuantity(1);
                      }}
                      type="button"
                    >
                      {option.color ? (
                        <span
                          aria-hidden="true"
                          className="variant-color-swatch"
                          style={{ backgroundColor: option.color }}
                        />
                      ) : null}
                      {option.value}
                      {option.stock === 0 ? <span className="sr-only">স্টকে নেই</span> : null}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
            {availableStock > 0 ? (
              <p className="availability in-stock">স্টকে আছে · {availableStock}টি পাওয়া যাবে</p>
            ) : (
              <p aria-live="polite" className="availability out-stock-message">
                এই বিকল্পটি এখন স্টকে নেই
              </p>
            )}
            <div className="purchase-actions">
              <div aria-label="পরিমাণ" className="quantity-stepper">
                <button
                  aria-label="একটি কমান"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  <Minus aria-hidden="true" />
                </button>
                <output aria-live="polite">{quantity}</output>
                <button
                  aria-label="একটি বাড়ান"
                  disabled={quantity >= availableStock}
                  onClick={() => setQuantity((value) => Math.min(availableStock, value + 1))}
                  type="button"
                >
                  <Plus aria-hidden="true" />
                </button>
              </div>
              <button
                className="add-cart-button"
                disabled={availableStock <= 0}
                onClick={() =>
                  addToCart(
                    product,
                    quantity,
                    variantLabel,
                    availableStock,
                    variantSku,
                    selectedPrice,
                  )
                }
                type="button"
              >
                <ShoppingBag aria-hidden="true" className="size-5" /> কার্টে যোগ করুন
              </button>
              <button
                aria-label={wished ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
                aria-pressed={wished}
                className={`detail-wishlist ${wished ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                type="button"
              >
                <Heart aria-hidden="true" fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>
            <button
              className="buy-now-button"
              disabled={availableStock <= 0}
              onClick={buyNow}
              type="button"
            >
              এখনই কিনুন
            </button>
            <div className="delivery-summary">
              <p>
                <strong>নমুনা estimate · ঢাকা:</strong> ১–২ দিন
              </p>
              <p>
                <strong>ঢাকার বাইরে:</strong> ৩–৫ দিন
              </p>
              <p>শুধু checkout-এর demo-তে COD বাছাই করা যায়; বাস্তব delivery বা return চালু নেই।</p>
            </div>
          </section>
        </div>

        <section aria-label="পণ্যের তথ্য" className="product-info-section">
          <div aria-label="পণ্যের তথ্যের বিভাগ" className="detail-tabs" role="tablist">
            {tabs.map((item) => (
              <button
                aria-selected={tab === item}
                className={tab === item ? 'active' : ''}
                key={item}
                onClick={() => setTab(item)}
                role="tab"
                type="button"
              >
                {item}
                {item === 'ক্রেতার কথা' ? ` (${reviewCount.toLocaleString('bn-BD')})` : ''}
              </button>
            ))}
          </div>
          <div aria-live="polite" className="detail-tab-panel" role="tabpanel">
            {tab === 'বিস্তারিত' ? (
              <div className="description-copy">
                <h2>পণ্যের গল্প</h2>
                <p>{product.description.bn}</p>
                <p lang="en">{product.description.en}</p>
                {product.isSample ? (
                  <p>
                    এই catalog-এর পণ্য, brand, বিবরণ ও দাম নমুনা। বাস্তব পণ্যের তথ্য বিক্রেতার কাছ
                    থেকে এখনো যাচাই করা হয়নি।
                  </p>
                ) : null}
              </div>
            ) : null}
            {tab === 'বৈশিষ্ট্য' ? (
              <div>
                <h2>পণ্যের বৈশিষ্ট্য</h2>
                <dl className="spec-list">
                  <div>
                    <dt>ব্র্যান্ড</dt>
                    <dd>{product.brand}</dd>
                  </div>
                  <div>
                    <dt>SKU</dt>
                    <dd>{product.sku}</dd>
                  </div>
                  <div>
                    <dt>দোকান</dt>
                    <dd>{product.category}</dd>
                  </div>
                  <div>
                    <dt>ট্যাগ</dt>
                    <dd>{product.tags.join(' · ')}</dd>
                  </div>
                  <div>
                    <dt>যোগ হয়েছে</dt>
                    <dd>{new Date(product.createdAt).toLocaleDateString('bn-BD')}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
            {tab === 'ক্রেতার কথা' ? (
              <section className="reviews-section" id="product-reviews">
                <h2>ক্রেতাদের মতামত</h2>
                <p className="checkout-safe-note">
                  {product.isSample
                    ? 'এগুলো নমুনা review; বাস্তব ক্রেতার মতামত নয়। আপনার লেখা মতামতও শুধু এই page-এ অস্থায়ীভাবে দেখা যাবে।'
                    : 'এখানে catalog-এ সংরক্ষিত review দেখানো হচ্ছে। নতুন মতামত এখন শুধু page-এ অস্থায়ীভাবে দেখা যাবে।'}
                </p>
                <div className="review-summary">
                  <div>
                    <strong>{average.toFixed(1)}</strong>
                    <span> / ৫</span>
                    <p>{reviewCount.toLocaleString('bn-BD')}টি মতামত</p>
                  </div>
                  <div className="rating-bars">
                    {breakdown.map(({ rating, count }) => (
                      <div className="rating-bar-row" key={rating}>
                        <span>{rating} তারা</span>
                        <span className="rating-bar">
                          <i
                            style={{
                              width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                            }}
                          />
                        </span>
                        <span>{count.toLocaleString('bn-BD')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <form className="review-form" onSubmit={onReviewSubmit}>
                  <h3>
                    {product.isSample ? 'নমুনা মতামত যোগ করে দেখুন' : 'মতামত লিখে preview দেখুন'}
                  </h3>
                  <div className="review-form-grid">
                    <label>
                      আপনার নাম
                      <input autoComplete="name" maxLength={60} name="name" required />
                    </label>
                    <label>
                      রেটিং
                      <select defaultValue="5" name="rating">
                        <option value="5">৫ তারা</option>
                        <option value="4">৪ তারা</option>
                        <option value="3">৩ তারা</option>
                        <option value="2">২ তারা</option>
                        <option value="1">১ তারা</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    আপনার মতামত
                    <textarea maxLength={500} minLength={8} name="comment" required rows={3} />
                  </label>
                  <div aria-live="polite" className="review-message">
                    {reviewMessage}
                  </div>
                  <button type="submit">মতামত যোগ করুন</button>
                </form>
                <div className="review-note-list">
                  {reviews.map((review) => (
                    <article className="review-paper-note" key={review.id}>
                      <div className="flex items-center justify-between gap-4">
                        <strong>{review.name}</strong>
                        <time dateTime={review.date}>
                          {new Date(`${review.date}T00:00:00`).toLocaleDateString('bn-BD')}
                        </time>
                      </div>
                      <p className="review-stars" aria-label={`${review.rating} তারা`}>
                        {'★'.repeat(review.rating)}
                        <span>{'★'.repeat(5 - review.rating)}</span>
                      </p>
                      <p>{review.comment}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
            {tab === 'ডেলিভারি ও ফেরত' ? (
              <div className="delivery-details">
                <h2>ডেলিভারি ও ফেরত</h2>
                <p>
                  এই demo-তে ঢাকার জন্য ১–২ দিন ও ঢাকার বাইরে ৩–৫ দিনের নমুনা estimate দেখানো হয়।
                  বাস্তব courier service বা delivery estimate এখনো যুক্ত নেই।
                </p>
                <p>
                  COD কেবল checkout-এর নমুনা option। বাস্তব payment, delivery, return বা refund
                  ব্যবস্থা চালু হয়নি।
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {related.length ? (
          <section className="related-section">
            <h2>এই দোকানের আরও পসরা</h2>
            <div className="related-row">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
        <div className="mobile-sticky-buy">
          <span>{formatBDT(selectedPrice)}</span>
          <button
            disabled={availableStock <= 0}
            onClick={() =>
              addToCart(product, quantity, variantLabel, availableStock, variantSku, selectedPrice)
            }
            type="button"
          >
            কার্টে যোগ করুন
          </button>
        </div>
        {lightbox ? (
          <div
            className="lightbox-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setLightbox(false);
            }}
          >
            <section
              aria-label="পণ্যের ছবির গ্যালারি"
              aria-modal="true"
              className="image-lightbox"
              ref={lightboxRef}
              role="dialog"
            >
              <button
                aria-label="ছবি বন্ধ করুন"
                className="lightbox-close"
                onClick={() => setLightbox(false)}
                ref={closeLightboxRef}
                type="button"
              >
                <X />
              </button>
              <button
                aria-label="আগের ছবি"
                className="lightbox-prev"
                onClick={() =>
                  setView(
                    (current) => (current + product.images.length - 1) % product.images.length,
                  )
                }
                type="button"
              >
                <ChevronLeft />
              </button>
              <ProductImage
                className="lightbox-art"
                imageUrl={product.imageUrls?.[view] ?? product.imageUrls?.[0]}
                name={product.nameBn}
                variant={product.image}
                view={view}
              />
              <button
                aria-label="পরের ছবি"
                className="lightbox-next"
                onClick={() => setView((current) => (current + 1) % product.images.length)}
                type="button"
              >
                <ChevronRight />
              </button>
              <p>
                {view + 1} / {product.images.length}
              </p>
            </section>
          </div>
        ) : null}
      </Container>
    </main>
  );
}
