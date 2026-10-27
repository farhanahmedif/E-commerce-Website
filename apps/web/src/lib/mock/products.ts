import { categories } from './categories';

export type ProductVariant = {
  name: string;
  options: { value: string; stock: number; color?: string }[];
};
export type ProductReview = {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
};
export type MockProduct = {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviewCount: number;
  stock: number;
  badge: string;
  image: string;
  imageUrls?: string[];
  images: string[];
  brand: string;
  description: { bn: string; en: string };
  variants: ProductVariant[];
  sku: string;
  tags: string[];
  createdAt: string;
  reviews: ProductReview[];
  isSample?: boolean;
  variantSkuByLabel?: Record<string, string>;
  variantStockByLabel?: Record<string, number>;
  variantPriceByLabel?: Record<string, number>;
};

export function getDefaultVariantSelections(product: MockProduct): Record<string, string> {
  const availableVariant = Object.entries(product.variantStockByLabel ?? {}).find(
    ([, stock]) => stock > 0,
  )?.[0];
  if (availableVariant) {
    return Object.fromEntries(
      availableVariant
        .split(' · ')
        .map((selection) => {
          const separator = selection.indexOf(': ');
          return separator < 0
            ? null
            : [selection.slice(0, separator), selection.slice(separator + 2)];
        })
        .filter((selection): selection is [string, string] => selection !== null),
    );
  }
  return Object.fromEntries(
    product.variants.map((variant) => [
      variant.name,
      variant.options.find((option) => option.stock > 0)?.value ?? variant.options[0]?.value ?? '',
    ]),
  );
}

export function getVariantStock(product: MockProduct, selections: Record<string, string>): number {
  if (product.variantStockByLabel) {
    const label = product.variants
      .map((variant) => `${variant.name}: ${selections[variant.name] ?? ''}`)
      .join(' · ');
    return Math.max(0, product.variantStockByLabel[label] ?? 0);
  }
  if (product.variants.length === 0) return product.stock;
  const optionStocks = product.variants.map(
    (variant) => variant.options.find((option) => option.value === selections[variant.name])?.stock,
  );
  const validStocks = optionStocks.filter((stock): stock is number => stock !== undefined);
  if (validStocks.length !== product.variants.length) return 0;
  return Math.max(0, Math.min(product.stock, ...validStocks));
}

export function getVariantSku(
  product: MockProduct,
  selections: Record<string, string>,
): string | undefined {
  if (!product.variantSkuByLabel) return undefined;
  const label = product.variants
    .map((variant) => `${variant.name}: ${selections[variant.name] ?? ''}`)
    .join(' · ');
  return product.variantSkuByLabel[label];
}

export function getVariantPrice(product: MockProduct, selections: Record<string, string>): number {
  const label = product.variants
    .map((variant) => `${variant.name}: ${selections[variant.name] ?? ''}`)
    .join(' · ');
  return product.variantPriceByLabel?.[label] ?? product.price;
}

type ProductSeed = Pick<
  MockProduct,
  | 'id'
  | 'slug'
  | 'nameBn'
  | 'nameEn'
  | 'category'
  | 'price'
  | 'oldPrice'
  | 'rating'
  | 'reviewCount'
  | 'stock'
  | 'badge'
  | 'image'
>;

const seeds: ProductSeed[] = [
  {
    id: 'p-1',
    slug: 'nakshi-kantha-tote',
    nameBn: 'নকশি কাঁথার কাপড়ের ব্যাগ',
    nameEn: 'Nakshi Kantha Tote',
    category: 'crafts',
    price: 85000,
    oldPrice: 105000,
    rating: 4.8,
    reviewCount: 124,
    stock: 3,
    badge: 'হাতের কাজ',
    image: 'woven',
  },
  {
    id: 'p-2',
    slug: 'sundarbans-honey',
    nameBn: 'সুন্দরবনের খাঁটি মধু',
    nameEn: 'Sundarbans Raw Honey',
    category: 'grocery',
    price: 42000,
    oldPrice: 50000,
    rating: 4.9,
    reviewCount: 86,
    stock: 18,
    badge: 'খাঁটি',
    image: 'honey',
  },
  {
    id: 'p-3',
    slug: 'jamdani-scarf',
    nameBn: 'জামদানি নকশার ওড়না',
    nameEn: 'Jamdani Pattern Orna',
    category: 'fashion',
    price: 125000,
    oldPrice: 150000,
    rating: 4.7,
    reviewCount: 53,
    stock: 7,
    badge: 'জনপ্রিয়',
    image: 'fabric',
  },
  {
    id: 'p-4',
    slug: 'terracotta-cup-set',
    nameBn: 'মাটির চায়ের কাপ সেট',
    nameEn: 'Terracotta Tea Cup Set',
    category: 'home',
    price: 56000,
    oldPrice: 70000,
    rating: 4.6,
    reviewCount: 39,
    stock: 12,
    badge: 'নতুন',
    image: 'clay',
  },
  {
    id: 'p-5',
    slug: 'bamboo-bluetooth-speaker',
    nameBn: 'বাঁশের ব্লুটুথ স্পিকার',
    nameEn: 'Bamboo Bluetooth Speaker',
    category: 'electronics',
    price: 189000,
    oldPrice: 225000,
    rating: 4.5,
    reviewCount: 72,
    stock: 4,
    badge: 'অফার',
    image: 'bamboo',
  },
  {
    id: 'p-6',
    slug: 'rajshahi-mango-pickle',
    nameBn: 'রাজশাহীর আমের আচার',
    nameEn: 'Rajshahi Mango Pickle',
    category: 'grocery',
    price: 28000,
    oldPrice: 35000,
    rating: 4.8,
    reviewCount: 112,
    stock: 25,
    badge: 'ঘরোয়া',
    image: 'pickle',
  },
  {
    id: 'p-7',
    slug: 'herbal-hair-oil',
    nameBn: 'ভেষজ চুলের তেল',
    nameEn: 'Herbal Hair Oil',
    category: 'beauty',
    price: 35000,
    oldPrice: 42000,
    rating: 4.4,
    reviewCount: 64,
    stock: 9,
    badge: 'দেশি',
    image: 'oil',
  },
  {
    id: 'p-8',
    slug: 'folk-tales-book',
    nameBn: 'বাংলার লোককথার ঝুলি',
    nameEn: 'Bengal Folk Tales',
    category: 'books',
    price: 32000,
    oldPrice: 40000,
    rating: 4.9,
    reviewCount: 91,
    stock: 16,
    badge: 'পাঠকের পছন্দ',
    image: 'book',
  },
  {
    id: 'p-9',
    slug: 'wooden-puzzle',
    nameBn: 'কাঠের রঙিন ধাঁধা',
    nameEn: 'Wooden Shape Puzzle',
    category: 'toys',
    price: 47000,
    oldPrice: 55000,
    rating: 4.7,
    reviewCount: 41,
    stock: 2,
    badge: 'নিরাপদ খেলনা',
    image: 'wood',
  },
  {
    id: 'p-10',
    slug: 'cotton-panjabi',
    nameBn: 'হাতে বোনা সুতি পাঞ্জাবি',
    nameEn: 'Handwoven Cotton Panjabi',
    category: 'fashion',
    price: 165000,
    oldPrice: 195000,
    rating: 4.6,
    reviewCount: 58,
    stock: 6,
    badge: 'নতুন',
    image: 'shirt',
  },
  {
    id: 'p-11',
    slug: 'jute-table-mat',
    nameBn: 'পাটের টেবিল ম্যাট',
    nameEn: 'Jute Table Mat Set',
    category: 'home',
    price: 39000,
    oldPrice: 48000,
    rating: 4.5,
    reviewCount: 33,
    stock: 14,
    badge: 'পরিবেশবান্ধব',
    image: 'jute',
  },
  {
    id: 'p-12',
    slug: 'shital-pati',
    nameBn: 'সিলেটি শীতল পাটি',
    nameEn: 'Sylheti Shital Pati',
    category: 'crafts',
    price: 245000,
    oldPrice: 290000,
    rating: 4.9,
    reviewCount: 28,
    stock: 5,
    badge: 'কারিগরের কাজ',
    image: 'mat',
  },
  {
    id: 'p-13',
    slug: 'muslin-pocket-scarf',
    nameBn: 'মসলিন ছোঁয়ার পকেট স্কার্ফ',
    nameEn: 'Muslin Pocket Scarf',
    category: 'fashion',
    price: 72000,
    oldPrice: 89000,
    rating: 4.7,
    reviewCount: 34,
    stock: 10,
    badge: 'নতুন',
    image: 'fabric',
  },
  {
    id: 'p-14',
    slug: 'handloom-check-shirt',
    nameBn: 'তাঁতের চেক শার্ট',
    nameEn: 'Handloom Check Shirt',
    category: 'fashion',
    price: 138000,
    oldPrice: 160000,
    rating: 4.6,
    reviewCount: 46,
    stock: 8,
    badge: 'দেশি তাঁত',
    image: 'shirt',
  },
  {
    id: 'p-15',
    slug: 'solar-lantern',
    nameBn: 'চার্জে জ্বলা সোলার লণ্ঠন',
    nameEn: 'Rechargeable Solar Lantern',
    category: 'electronics',
    price: 215000,
    oldPrice: 250000,
    rating: 4.5,
    reviewCount: 31,
    stock: 11,
    badge: 'সাশ্রয়ী',
    image: 'bamboo',
  },
  {
    id: 'p-16',
    slug: 'wireless-earbuds',
    nameBn: 'দৈনন্দিনের ওয়্যারলেস ইয়ারবাড',
    nameEn: 'Everyday Wireless Earbuds',
    category: 'electronics',
    price: 320000,
    oldPrice: 375000,
    rating: 4.4,
    reviewCount: 67,
    stock: 0,
    badge: 'অফার',
    image: 'bamboo',
  },
  {
    id: 'p-17',
    slug: 'rangpur-potato',
    nameBn: 'রংপুরের বাছাই করা আলু',
    nameEn: 'Rangpur Farm Potatoes',
    category: 'grocery',
    price: 3800,
    oldPrice: 4500,
    rating: 4.6,
    reviewCount: 29,
    stock: 40,
    badge: 'টাটকা',
    image: 'pickle',
  },
  {
    id: 'p-18',
    slug: 'sundarbans-dry-fish',
    nameBn: 'উপকূলের রোদে শুকানো শুঁটকি',
    nameEn: 'Sun-dried Coastal Fish',
    category: 'grocery',
    price: 68000,
    oldPrice: 79000,
    rating: 4.7,
    reviewCount: 52,
    stock: 7,
    badge: 'ঘরোয়া',
    image: 'honey',
  },
  {
    id: 'p-19',
    slug: 'cane-storage-basket',
    nameBn: 'বেতের বোনা রাখার ঝুড়ি',
    nameEn: 'Woven Cane Storage Basket',
    category: 'home',
    price: 92000,
    oldPrice: 110000,
    rating: 4.8,
    reviewCount: 44,
    stock: 6,
    badge: 'হাতের কাজ',
    image: 'woven',
  },
  {
    id: 'p-20',
    slug: 'clay-water-pitcher',
    nameBn: 'মাটির ঠান্ডা জলের কলস',
    nameEn: 'Terracotta Water Pitcher',
    category: 'home',
    price: 75000,
    oldPrice: 90000,
    rating: 4.5,
    reviewCount: 27,
    stock: 9,
    badge: 'মাটির ছোঁয়া',
    image: 'clay',
  },
  {
    id: 'p-21',
    slug: 'rose-water',
    nameBn: 'গোলাপজল দিয়ে কোমল ত্বকের যত্ন',
    nameEn: 'Rose Water Face Mist',
    category: 'beauty',
    price: 26000,
    oldPrice: 32000,
    rating: 4.6,
    reviewCount: 38,
    stock: 20,
    badge: 'প্রাকৃতিক',
    image: 'oil',
  },
  {
    id: 'p-22',
    slug: 'coconut-body-oil',
    nameBn: 'খাঁটি নারকেল তেল',
    nameEn: 'Pure Coconut Body Oil',
    category: 'beauty',
    price: 44000,
    oldPrice: 52000,
    rating: 4.5,
    reviewCount: 49,
    stock: 15,
    badge: 'খাঁটি',
    image: 'oil',
  },
  {
    id: 'p-23',
    slug: 'science-for-curious-kids',
    nameBn: 'কৌতূহলী শিশুদের বিজ্ঞানের বই',
    nameEn: 'Science for Curious Kids',
    category: 'books',
    price: 58000,
    oldPrice: 68000,
    rating: 4.8,
    reviewCount: 56,
    stock: 18,
    badge: 'শেখার আনন্দ',
    image: 'book',
  },
  {
    id: 'p-24',
    slug: 'folk-doll-pair',
    nameBn: 'বাংলার লোকজ পুতুল জোড়া',
    nameEn: 'Bengal Folk Doll Pair',
    category: 'toys',
    price: 64000,
    oldPrice: 76000,
    rating: 4.9,
    reviewCount: 35,
    stock: 5,
    badge: 'কারিগরের কাজ',
    image: 'wood',
  },
];

const customerNames = [
  'মেহজাবিন আক্তার',
  'ইমরান হোসেন',
  'তানিয়া রহমান',
  'সাদমান কবির',
  'রুবাইয়া ইসলাম',
  'নাবিল আহমেদ',
  'সুমাইয়া নূর',
  'ফারহান চৌধুরী',
  'নুসরাত জাহান',
  'রাকিবুল হাসান',
  'সাবিহা রহমান',
  'তাসনিম আক্তার',
];
const reviewComments = [
  'ছবির মতোই সুন্দর, হাতে পেয়ে খুব ভালো লেগেছে। প্যাকেটও ছিল যত্ন করে করা।',
  'দাম অনুযায়ী মান বেশ ভালো। সময়মতো পেয়েছি, পরিবারের সবাই পছন্দ করেছে।',
  'দেশি জিনিসের গুণটা আলাদা—ব্যবহারে আরাম আর কাজটাও খুব পরিপাটি।',
  'পণ্যটি বেশ কাজে লাগছে। আবার কেনার মতো অভিজ্ঞতা হয়েছে।',
  'রং ও ফিনিশিং সুন্দর। ছোটখাটো উপহার হিসেবেও চমৎকার হবে।',
];
const categoryBrand: Record<string, string> = {
  fashion: 'তাঁতঘর',
  electronics: 'সহজ টেক',
  grocery: 'মাটির বাজার',
  home: 'ঘরকুটির',
  beauty: 'প্রকৃতি যত্ন',
  books: 'পাতার গল্প',
  toys: 'খেলার হাট',
  crafts: 'কারুশিল্প',
};
const categoryCopy: Record<string, { bn: string; en: string }> = {
  fashion: {
    bn: 'দেশি তাঁত ও যত্নের কারুকাজে তৈরি, আরাম আর ঐতিহ্যকে একসঙ্গে রাখে। প্রতিদিনের ব্যবহার কিংবা উপহারে মানানসই।',
    en: 'Made with care and inspired by Bangladeshi craft, this piece brings comfort and tradition together for everyday use or gifting.',
  },
  electronics: {
    bn: 'সহজে ব্যবহার করা যায়, দৈনন্দিন কাজে নির্ভরযোগ্য সঙ্গী। বাছাই করা উপকরণ আর পরিষ্কার নির্দেশনা নিয়ে তৈরি।',
    en: 'An easy-to-use, dependable companion for daily life, selected for practical features and clear setup.',
  },
  grocery: {
    bn: 'বাংলার পরিচিত অঞ্চলের বাছাই করা উপকরণ থেকে প্রস্তুত। স্বাদ ও মান অক্ষুণ্ন রাখতে যত্নে প্যাক করা হয়।',
    en: 'Selected from familiar Bangladeshi growing regions and packed with care to preserve its taste and quality.',
  },
  home: {
    bn: 'ঘরের কাজে লাগে, আবার ঘরকেও আপন করে তোলে। অভিজ্ঞ কারিগরের হাতে তৈরি এবং যত্নে পাঠানো হয়।',
    en: 'Useful around the home and made to add warmth to your space, crafted by experienced local makers.',
  },
  beauty: {
    bn: 'দৈনন্দিন যত্নের জন্য সহজ ও কোমল পছন্দ। উপকরণ সম্পর্কে পরিষ্কার তথ্যসহ যত্ন করে তৈরি।',
    en: 'A gentle, practical choice for a daily care routine, prepared with clear ingredient information.',
  },
  books: {
    bn: 'পড়ার আনন্দ আর নতুন কিছু জানার কৌতূহল জাগায়। ঘরে কিংবা উপহার—দুইভাবেই সুন্দর পছন্দ।',
    en: 'A thoughtful read that sparks curiosity and makes a lovely addition to your shelf or a meaningful gift.',
  },
  toys: {
    bn: 'খেলতে খেলতে শেখা আর কল্পনার জগৎ বানানোর জন্য। শিশুদের ব্যবহারের কথা ভেবে মসৃণভাবে তৈরি।',
    en: 'Made for playful learning and imaginative stories, with smooth finishes designed for little hands.',
  },
  crafts: {
    bn: 'স্থানীয় কারিগরের হাতে ধৈর্য আর মমতায় তৈরি। প্রতিটি কাজে আছে বাংলার নকশা ও নিজস্ব স্বভাব।',
    en: 'Patiently made by a local artisan, with patterns and character rooted in Bangladeshi craft traditions.',
  },
};
const variantsByCategory: Record<string, ProductVariant[]> = {
  fashion: [
    {
      name: 'রং',
      options: [
        { value: 'মেরুন', stock: 4, color: '#8d302f' },
        { value: 'সবুজ', stock: 5, color: '#286044' },
        { value: 'হলুদ', stock: 0, color: '#efbd38' },
      ],
    },
    {
      name: 'সাইজ',
      options: [
        { value: 'এক সাইজ', stock: 7 },
        { value: 'মাঝারি', stock: 5 },
        { value: 'বড়', stock: 0 },
      ],
    },
  ],
  electronics: [
    {
      name: 'রং',
      options: [
        { value: 'প্রাকৃতিক', stock: 6, color: '#b79a63' },
        { value: 'কালো', stock: 0, color: '#292b27' },
      ],
    },
  ],
  home: [
    {
      name: 'সাইজ',
      options: [
        { value: 'ছোট', stock: 5 },
        { value: 'মাঝারি', stock: 7 },
        { value: 'বড়', stock: 0 },
      ],
    },
  ],
  beauty: [
    {
      name: 'পরিমাণ',
      options: [
        { value: '১০০ মি.লি.', stock: 12 },
        { value: '২০০ মি.লি.', stock: 8 },
      ],
    },
  ],
  grocery: [
    {
      name: 'পরিমাণ',
      options: [
        { value: '২৫০ গ্রাম', stock: 12 },
        { value: '৫০০ গ্রাম', stock: 6 },
        { value: '১ কেজি', stock: 0 },
      ],
    },
  ],
  books: [
    {
      name: 'সংস্করণ',
      options: [
        { value: 'পেপারব্যাক', stock: 9 },
        { value: 'হার্ডকভার', stock: 0 },
      ],
    },
  ],
  toys: [
    {
      name: 'রং',
      options: [
        { value: 'লাল', stock: 3, color: '#b74337' },
        { value: 'নীল', stock: 2, color: '#426b89' },
        { value: 'হলুদ', stock: 0, color: '#e7b740' },
      ],
    },
  ],
  crafts: [
    {
      name: 'নকশা',
      options: [
        { value: 'লাল-সবুজ', stock: 3 },
        { value: 'নীল-সোনালি', stock: 2 },
        { value: 'হলুদ-সবুজ', stock: 0 },
      ],
    },
  ],
};

export const products: MockProduct[] = seeds.map((seed, index) => {
  const category = categories.find((item) => item.slug === seed.category);
  const variants = variantsByCategory[seed.category] ?? [];
  const reviews = Array.from({ length: 3 + (index % 3) }, (_, reviewIndex) => ({
    id: `${seed.id}-review-${reviewIndex + 1}`,
    name: customerNames[(index * 3 + reviewIndex) % customerNames.length]!,
    rating: Math.max(3, Math.min(5, Math.round(seed.rating) - (reviewIndex === 2 ? 1 : 0))),
    date: `2025-0${(reviewIndex % 9) + 1}-${String(((index + reviewIndex) % 27) + 1).padStart(2, '0')}`,
    comment: reviewComments[(index + reviewIndex) % reviewComments.length]!,
  }));
  const copy = categoryCopy[seed.category]!;
  const options = variants.flatMap((variant) => variant.options.map((option) => option.value));
  return {
    ...seed,
    rating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
    reviewCount: reviews.length,
    images: [`${seed.image}-front`, `${seed.image}-detail`, `${seed.image}-back`],
    brand: categoryBrand[seed.category]!,
    description: { bn: `${seed.nameBn}—${copy.bn}`, en: `${seed.nameEn}. ${copy.en}` },
    variants,
    sku: `HG-${seed.category.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(4, '0')}`,
    tags: [
      seed.nameBn,
      seed.nameEn,
      seed.badge,
      category?.nameBn ?? '',
      category?.nameEn ?? '',
      ...options,
    ],
    createdAt: new Date(Date.UTC(2025, 8 + (index % 4), (index % 27) + 1)).toISOString(),
    reviews,
    isSample: true,
  };
});

export type ProductFilters = {
  category?: string;
  q?: string;
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

export async function getProducts(filters: ProductFilters = {}): Promise<MockProduct[]> {
  const query = filters.q?.trim().toLocaleLowerCase('bn-BD');
  const filtered = products.filter((product) => {
    const searchable = [product.nameBn, product.nameEn, ...product.tags]
      .join(' ')
      .toLocaleLowerCase('bn-BD');
    return (
      (!filters.category || product.category === filters.category) &&
      (!query || searchable.includes(query)) &&
      (filters.minPrice === undefined || product.price >= filters.minPrice) &&
      (filters.maxPrice === undefined || product.price <= filters.maxPrice) &&
      (!filters.brand || product.brand === filters.brand) &&
      (!filters.rating || product.rating >= filters.rating) &&
      (!filters.size ||
        product.variants.some(
          (variant) =>
            variant.name.toLowerCase().includes('সাইজ') &&
            variant.options.some((option) => option.value === filters.size && option.stock > 0),
        )) &&
      (!filters.color ||
        product.variants.some(
          (variant) =>
            variant.name === 'রং' &&
            variant.options.some((option) => option.value === filters.color && option.stock > 0),
        )) &&
      (!filters.inStock || product.stock > 0) &&
      (!filters.onSale || product.oldPrice > product.price)
    );
  });
  switch (filters.sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    default:
      filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return filtered;
}

export async function getProductBySlug(slug: string): Promise<MockProduct | undefined> {
  return products.find((product) => product.slug === slug);
}
export async function getRelatedProducts(product: MockProduct): Promise<MockProduct[]> {
  return products
    .filter((candidate) => candidate.category === product.category && candidate.id !== product.id)
    .slice(0, 6);
}
export async function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
