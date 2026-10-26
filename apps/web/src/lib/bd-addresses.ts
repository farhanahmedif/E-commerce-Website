export type AddressDivision = {
  name: string;
  districts: { name: string; thanas: string[] }[];
};

export const addressDivisions: AddressDivision[] = [
  {
    name: 'ঢাকা',
    districts: [
      { name: 'ঢাকা', thanas: ['ধানমন্ডি', 'মিরপুর', 'উত্তরা', 'মতিঝিল'] },
      { name: 'গাজীপুর', thanas: ['গাজীপুর সদর', 'টঙ্গী'] },
      { name: 'নারায়ণগঞ্জ', thanas: ['সদর', 'ফতুল্লা'] },
    ],
  },
  {
    name: 'চট্টগ্রাম',
    districts: [
      { name: 'চট্টগ্রাম', thanas: ['পাঁচলাইশ', 'কোতোয়ালী', 'হালিশহর'] },
      { name: 'কক্সবাজার', thanas: ['সদর', 'উখিয়া'] },
    ],
  },
  {
    name: 'রাজশাহী',
    districts: [
      { name: 'রাজশাহী', thanas: ['বোয়ালিয়া', 'রাজপাড়া'] },
      { name: 'বগুড়া', thanas: ['সদর', 'শেরপুর'] },
    ],
  },
  {
    name: 'খুলনা',
    districts: [
      { name: 'খুলনা', thanas: ['খুলনা সদর', 'দৌলতপুর'] },
      { name: 'যশোর', thanas: ['সদর', 'অভয়নগর'] },
    ],
  },
  {
    name: 'বরিশাল',
    districts: [{ name: 'বরিশাল', thanas: ['কোতোয়ালী', 'বন্দর'] }],
  },
  {
    name: 'সিলেট',
    districts: [{ name: 'সিলেট', thanas: ['কোতোয়ালী', 'জালালাবাদ'] }],
  },
  {
    name: 'রংপুর',
    districts: [{ name: 'রংপুর', thanas: ['সদর', 'গঙ্গাচড়া'] }],
  },
  {
    name: 'ময়মনসিংহ',
    districts: [{ name: 'ময়মনসিংহ', thanas: ['সদর', 'ত্রিশাল'] }],
  },
];

export function getDistricts(division: string) {
  return addressDivisions.find((item) => item.name === division)?.districts ?? [];
}

export function getThanas(division: string, district: string) {
  return getDistricts(division).find((item) => item.name === district)?.thanas ?? [];
}
