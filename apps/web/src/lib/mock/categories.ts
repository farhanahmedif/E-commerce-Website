export type Category = {
  slug: string;
  nameBn: string;
  nameEn: string;
  note: string;
  color: string;
};

export const categories: Category[] = [
  {
    slug: 'fashion',
    nameBn: 'ফ্যাশন',
    nameEn: 'Fashion',
    note: 'দেশি নকশার ছোঁয়া',
    color: '#f0d9d1',
  },
  {
    slug: 'electronics',
    nameBn: 'ইলেকট্রনিক্স',
    nameEn: 'Electronics',
    note: 'কাজের স্মার্ট সঙ্গী',
    color: '#dce8db',
  },
  {
    slug: 'grocery',
    nameBn: 'গ্রোসারি',
    nameEn: 'Grocery',
    note: 'রোজকার টাটকা বাজার',
    color: '#e7edd2',
  },
  {
    slug: 'home',
    nameBn: 'ঘর-গৃহস্থালি',
    nameEn: 'Home & Living',
    note: 'ঘরের আপন আয়োজন',
    color: '#f5dfbb',
  },
  {
    slug: 'beauty',
    nameBn: 'বিউটি',
    nameEn: 'Beauty',
    note: 'নিজের যত্নে দেশি পছন্দ',
    color: '#f3dce2',
  },
  { slug: 'books', nameBn: 'বই', nameEn: 'Books', note: 'পাতায় পাতায় গল্প', color: '#e9e0ce' },
  { slug: 'toys', nameBn: 'খেলনা', nameEn: 'Toys', note: 'ছোটদের বড় আনন্দ', color: '#dce8eb' },
  {
    slug: 'crafts',
    nameBn: 'হাতের কাজ',
    nameEn: 'Handmade',
    note: 'কারিগরের মমতা',
    color: '#f4e0c2',
  },
];
