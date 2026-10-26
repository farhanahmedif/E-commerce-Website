import { z } from 'zod';
import { addressDivisions, getDistricts, getThanas } from '@/lib/bd-addresses';
import { paymentMethods } from '@/lib/orders';

const bdPhonePattern = /^(?:01\d{9}|\+8801\d{9})$/;

export const checkoutSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, 'নাম অন্তত ২ অক্ষরের লিখুন।')
      .max(80, 'নাম ৮০ অক্ষরের মধ্যে রাখুন।'),
    phone: z
      .string()
      .trim()
      .regex(
        bdPhonePattern,
        'বাংলাদেশের ১১ সংখ্যার মোবাইল নম্বর লিখুন (01XXXXXXXXX বা +8801XXXXXXXXX)।',
      ),
    email: z.union([z.literal(''), z.string().trim().email('সঠিক ইমেইল ঠিকানা লিখুন।')]),
    division: z.string().min(1, 'বিভাগ বেছে নিন।'),
    district: z.string().min(1, 'জেলা বেছে নিন।'),
    upazila: z.string().min(1, 'থানা বা উপজেলা বেছে নিন।'),
    address: z
      .string()
      .trim()
      .min(8, 'পূর্ণ ঠিকানা অন্তত ৮ অক্ষরে লিখুন।')
      .max(300, 'ঠিকানা ৩০০ অক্ষরের মধ্যে রাখুন।'),
    orderNote: z.string().trim().max(300, 'নোট ৩০০ অক্ষরের মধ্যে রাখুন।'),
    deliveryMethod: z.enum(['inside-dhaka', 'outside-dhaka']),
    paymentMethod: z.enum(paymentMethods),
    paymentSenderPhone: z.string().trim(),
    transactionId: z.string().trim(),
  })
  .superRefine((value, context) => {
    if (value.paymentMethod !== 'cod') {
      if (!bdPhonePattern.test(value.paymentSenderPhone)) {
        context.addIssue({
          code: 'custom',
          path: ['paymentSenderPhone'],
          message: 'যে নম্বর থেকে টাকা পাঠাবেন, সেটি 01XXXXXXXXX বা +8801XXXXXXXXX আকারে লিখুন।',
        });
      }
      if (value.transactionId.length < 4 || value.transactionId.length > 40) {
        context.addIssue({
          code: 'custom',
          path: ['transactionId'],
          message: 'ডেমো লেনদেন আইডি ৪ থেকে ৪০ অক্ষরের মধ্যে লিখুন।',
        });
      }
    }
    const districtOptions = getDistricts(value.division);
    if (!addressDivisions.some((division) => division.name === value.division)) {
      context.addIssue({ code: 'custom', path: ['division'], message: 'বিভাগের তথ্য মিলছে না।' });
    } else if (!districtOptions.some((district) => district.name === value.district)) {
      context.addIssue({
        code: 'custom',
        path: ['district'],
        message: 'এই বিভাগের একটি জেলা বেছে নিন।',
      });
    } else if (!getThanas(value.division, value.district).includes(value.upazila)) {
      context.addIssue({
        code: 'custom',
        path: ['upazila'],
        message: 'এই জেলার একটি থানা বা উপজেলা বেছে নিন।',
      });
    }
  });

export type CheckoutValues = z.infer<typeof checkoutSchema>;
