'use client';

import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ChevronDown, ShieldCheck } from 'lucide-react';
import { addressDivisions, getDistricts, getThanas } from '@/lib/bd-addresses';
import { checkoutSchema, type CheckoutValues } from '@/lib/checkout-validation';
import { formatBDT } from '@/lib/formatBDT';
import { getDeliveryEstimate, paymentMethods, placeOrder } from '@/lib/orders';
import { getPricingQuote, type DeliveryMethod } from '@/lib/pricing';
import { useShopStore } from '@/lib/store';

const initialValues: CheckoutValues = {
  customerName: '',
  phone: '',
  email: '',
  division: 'ঢাকা',
  district: 'ঢাকা',
  upazila: 'ধানমন্ডি',
  address: '',
  orderNote: '',
  deliveryMethod: 'inside-dhaka',
  paymentMethod: 'cod',
  paymentSenderPhone: '',
  transactionId: '',
};

const paymentNames: Record<(typeof paymentMethods)[number], string> = {
  cod: 'ক্যাশ অন ডেলিভারি',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
  card: 'কার্ড',
};

function FormField({
  id,
  label,
  error,
  hint,
  children,
  required = false,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ');
  const control = isValidElement(children)
    ? cloneElement(
        children as ReactElement<{ 'aria-describedby'?: string; 'aria-invalid'?: boolean }>,
        { 'aria-describedby': describedBy || undefined, 'aria-invalid': Boolean(error) },
      )
    : children;
  return (
    <div className="checkout-field">
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {control}
      {hint ? <small id={`${id}-hint`}>{hint}</small> : null}
      {error ? (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutClient() {
  const router = useRouter();
  const cart = useShopStore((state) => state.cart);
  const couponCode = useShopStore((state) => state.couponCode);
  const hydrated = useShopStore((state) => state.hasHydrated);
  const setCouponCode = useShopStore((state) => state.setCouponCode);
  const clearCart = useShopStore((state) => state.clearCart);
  const [values, setValues] = useState<CheckoutValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponDraft, setCouponDraft] = useState(couponCode);
  const [couponMessage, setCouponMessage] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const districts = getDistricts(values.division);
  const thanas = getThanas(values.division, values.district);
  const quote = useMemo(
    () =>
      getPricingQuote(
        cart.map(
          ({
            productId,
            quantity,
            variantLabel,
            slug,
            nameBn,
            image,
            price,
            stock,
            variantSku,
            isSample,
          }) => ({
            productId,
            quantity,
            variantLabel,
            slug,
            nameBn,
            image,
            price,
            stock,
            variantSku,
            isSample,
          }),
        ),
        couponCode,
        values.deliveryMethod,
      ),
    [cart, couponCode, values.deliveryMethod],
  );

  useEffect(() => {
    if (!hydrated) void useShopStore.persist.rehydrate();
  }, [hydrated]);
  useEffect(() => {
    if (hydrated && cart.length === 0) router.replace('/cart');
  }, [cart.length, hydrated, router]);
  useEffect(() => setCouponDraft(couponCode), [couponCode]);

  function update<K extends keyof CheckoutValues>(key: K, value: CheckoutValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      if (key === 'division') {
        delete next.district;
        delete next.upazila;
      }
      if (key === 'district') delete next.upazila;
      return next;
    });
  }

  function applyCoupon() {
    const nextQuote = getPricingQuote(
      cart.map(
        ({
          productId,
          quantity,
          variantLabel,
          slug,
          nameBn,
          image,
          price,
          stock,
          variantSku,
          isSample,
        }) => ({
          productId,
          quantity,
          variantLabel,
          slug,
          nameBn,
          image,
          price,
          stock,
          variantSku,
          isSample,
        }),
      ),
      couponDraft,
      values.deliveryMethod,
    );
    if (!couponDraft.trim() || nextQuote.couponError) {
      setCouponMessage(nextQuote.couponError || 'কুপন কোডটি লিখুন।');
      return;
    }
    setCouponCode(nextQuote.couponCode);
    setCouponMessage(`“${nextQuote.couponCode}” কুপনটি যুক্ত হয়েছে।`);
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    const result = checkoutSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        nextErrors[key] ??= issue.message;
      }
      setErrors(nextErrors);
      const firstInvalidField = Object.keys(nextErrors)[0];
      if (firstInvalidField) document.getElementById(`checkout-${firstInvalidField}`)?.focus();
      return;
    }
    if (quote.couponError) {
      setCouponMessage(quote.couponError);
      document.getElementById('checkout-coupon')?.focus();
      return;
    }
    if (quote.items.length !== cart.length || quote.items.length === 0 || quote.total <= 0) {
      setSubmitMessage(
        'ঝুড়ির এক বা একাধিক পণ্য আর স্টকে নেই। কার্টে ফিরে সেগুলো সরিয়ে আবার চেষ্টা করুন।',
      );
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    setSubmitMessage('অর্ডারটি তৈরি হচ্ছে…');
    try {
      const order = await placeOrder({
        items: quote.items,
        customerName: result.data.customerName,
        phone: result.data.phone,
        email: result.data.email,
        division: result.data.division,
        district: result.data.district,
        upazila: result.data.upazila,
        address: result.data.address,
        orderNote: result.data.orderNote,
        deliveryMethod: result.data.deliveryMethod,
        paymentMethod: result.data.paymentMethod,
        paymentSenderPhone: result.data.paymentSenderPhone,
        transactionId: result.data.transactionId,
        couponCode: quote.couponCode,
        subtotal: quote.subtotal,
        discount: quote.discount,
        deliveryCharge: quote.deliveryCharge,
        total: quote.total,
      });
      clearCart();
      router.push(`/order/success/${order.id}`);
    } catch (error: unknown) {
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      );
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  if (!hydrated || cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-loading" aria-live="polite">
          চেকআউট প্রস্তুত হচ্ছে…
        </div>
      </main>
    );
  }

  const onlinePayment = values.paymentMethod !== 'cod';
  return (
    <main className="checkout-page">
      <div className="mx-auto max-w-[var(--content-width)] px-4 sm:px-6 lg:px-8">
        <p className="listing-eyebrow">আপনার কেনাকাটার শেষ ধাপ</p>
        <h1 className="checkout-title">অর্ডার সম্পন্ন করুন</h1>
        <p className="checkout-lead">তথ্য দিয়ে Cash on Delivery order backend-এ জমা দিন।</p>
        <p className="payment-demo-panel" role="note">
          Order backend-এ সংরক্ষিত হবে; বিক্রেতা dashboard, বাস্তব payment gateway বা delivery
          service এখনো যুক্ত হয়নি।
        </p>
        <form className="checkout-layout" noValidate onSubmit={submitOrder}>
          <div className="checkout-sections">
            <section aria-labelledby="contact-heading" className="checkout-section">
              <div className="checkout-section-heading">
                <span>১</span>
                <div>
                  <h2 id="contact-heading">যোগাযোগ ও ঠিকানা</h2>
                  <p>Order তৈরি করতে নাম, ফোন ও delivery address backend-এ পাঠানো হবে।</p>
                </div>
              </div>
              <div className="checkout-fields-grid">
                <FormField
                  id="checkout-customerName"
                  label="আপনার পুরো নাম"
                  error={errors.customerName}
                  required
                >
                  <input
                    autoComplete="name"
                    id="checkout-customerName"
                    maxLength={80}
                    onChange={(event) => update('customerName', event.target.value)}
                    value={values.customerName}
                  />
                </FormField>
                <FormField
                  id="checkout-phone"
                  label="মোবাইল নম্বর"
                  error={errors.phone}
                  hint="01XXXXXXXXX অথবা +8801XXXXXXXXX"
                  required
                >
                  <input
                    autoComplete="tel"
                    id="checkout-phone"
                    inputMode="tel"
                    maxLength={14}
                    onChange={(event) => update('phone', event.target.value)}
                    value={values.phone}
                  />
                </FormField>
                <FormField id="checkout-email" label="ইমেইল" error={errors.email} hint="ঐচ্ছিক">
                  <input
                    autoComplete="email"
                    id="checkout-email"
                    onChange={(event) => update('email', event.target.value)}
                    type="email"
                    value={values.email}
                  />
                </FormField>
                <FormField id="checkout-division" label="বিভাগ" error={errors.division} required>
                  <select
                    id="checkout-division"
                    onChange={(event) => {
                      const nextDivision = event.target.value;
                      const nextDistrict = getDistricts(nextDivision)[0]?.name ?? '';
                      const nextThana = getThanas(nextDivision, nextDistrict)[0] ?? '';
                      setValues((current) => ({
                        ...current,
                        division: nextDivision,
                        district: nextDistrict,
                        upazila: nextThana,
                      }));
                      setErrors((current) => {
                        const next = { ...current };
                        delete next.division;
                        delete next.district;
                        delete next.upazila;
                        return next;
                      });
                    }}
                    value={values.division}
                  >
                    {addressDivisions.map((division) => (
                      <option key={division.name} value={division.name}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField id="checkout-district" label="জেলা" error={errors.district} required>
                  <select
                    id="checkout-district"
                    onChange={(event) => {
                      const nextDistrict = event.target.value;
                      setValues((current) => ({
                        ...current,
                        district: nextDistrict,
                        upazila: getThanas(current.division, nextDistrict)[0] ?? '',
                      }));
                      setErrors((current) => {
                        const next = { ...current };
                        delete next.district;
                        delete next.upazila;
                        return next;
                      });
                    }}
                    value={values.district}
                  >
                    {districts.map((district) => (
                      <option key={district.name} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  id="checkout-upazila"
                  label="থানা / উপজেলা"
                  error={errors.upazila}
                  required
                >
                  <select
                    id="checkout-upazila"
                    onChange={(event) => update('upazila', event.target.value)}
                    value={values.upazila}
                  >
                    {thanas.map((thana) => (
                      <option key={thana} value={thana}>
                        {thana}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  id="checkout-address"
                  label="বাড়ি, সড়ক ও এলাকার ঠিকানা"
                  error={errors.address}
                  required
                >
                  <textarea
                    autoComplete="street-address"
                    id="checkout-address"
                    maxLength={300}
                    onChange={(event) => update('address', event.target.value)}
                    rows={3}
                    value={values.address}
                  />
                </FormField>
                <FormField
                  id="checkout-orderNote"
                  label="অর্ডার নোট"
                  error={errors.orderNote}
                  hint="ঐচ্ছিক"
                >
                  <textarea
                    id="checkout-orderNote"
                    maxLength={300}
                    onChange={(event) => update('orderNote', event.target.value)}
                    rows={3}
                    value={values.orderNote}
                  />
                </FormField>
              </div>
            </section>

            <section aria-labelledby="delivery-heading" className="checkout-section">
              <div className="checkout-section-heading">
                <span>২</span>
                <div>
                  <h2 id="delivery-heading">ডেলিভারি পদ্ধতি</h2>
                  <p>এলাকা অনুযায়ী পৌঁছানোর সময় ও চার্জ।</p>
                </div>
              </div>
              <div className="choice-grid">
                {(
                  [
                    ['inside-dhaka', 'ঢাকার ভেতরে', '১ থেকে ২ দিন', '৳ ৬০'],
                    ['outside-dhaka', 'ঢাকার বাইরে', '৩ থেকে ৫ দিন', '৳ ১২০'],
                  ] as const
                ).map(([method, label, estimate, charge]) => (
                  <label
                    className={`choice-card ${values.deliveryMethod === method ? 'selected' : ''}`}
                    key={method}
                  >
                    <input
                      checked={values.deliveryMethod === method}
                      name="deliveryMethod"
                      onChange={() => update('deliveryMethod', method as DeliveryMethod)}
                      type="radio"
                    />
                    <span className="choice-check">
                      <Check aria-hidden="true" />
                    </span>
                    <strong>{label}</strong>
                    <small>{estimate}</small>
                    <b>{quote.deliveryCharge === 0 ? 'ফ্রি ডেলিভারি' : charge}</b>
                  </label>
                ))}
              </div>
              <p aria-live="polite" className="delivery-note">
                {quote.deliveryCharge === 0
                  ? 'আপনার কুপন বা ৳ ১,৫০০ বাজারের জন্য ডেলিভারি ফ্রি।'
                  : '৳ ১,৫০০ বা তার বেশি বাজার করলে ডেলিভারি ফ্রি হবে।'}
              </p>
            </section>

            <section aria-labelledby="payment-heading" className="checkout-section">
              <div className="checkout-section-heading">
                <span>৩</span>
                <div>
                  <h2 id="payment-heading">পেমেন্ট পদ্ধতি</h2>
                  <p>আপনার সুবিধামতো পদ্ধতি বেছে নিন।</p>
                </div>
              </div>
              <div className="payment-options">
                {paymentMethods.map((method) => (
                  <label
                    className={`payment-option ${values.paymentMethod === method ? 'selected' : ''}`}
                    key={method}
                  >
                    <input
                      checked={values.paymentMethod === method}
                      disabled={method !== 'cod'}
                      name="paymentMethod"
                      onChange={() => update('paymentMethod', method)}
                      type="radio"
                    />
                    <span className="payment-option-mark">
                      <Check aria-hidden="true" />
                    </span>
                    <span>{paymentNames[method]}</span>
                    {method !== 'cod' ? <small>এখনো চালু হয়নি</small> : null}
                  </label>
                ))}
              </div>
              {onlinePayment ? (
                <div className="payment-demo-panel">
                  <strong>ডেমো মোড — এখানে কোনো টাকা কাটা হবে না</strong>
                  <p>
                    ভবিষ্যৎ পেমেন্টে {paymentNames[values.paymentMethod]} অ্যাপ থেকে Send Money করে
                    প্রেরকের নম্বর ও Transaction ID দিতে হবে। এটি ডেমো—এখন বাস্তবে টাকা পাঠাবেন না;
                    নমুনা তথ্য দিয়েই অর্ডার চালিয়ে যান।
                  </p>
                  <div className="checkout-fields-grid">
                    <FormField
                      id="checkout-paymentSenderPhone"
                      label="প্রেরকের মোবাইল নম্বর"
                      error={errors.paymentSenderPhone}
                      required
                    >
                      <input
                        autoComplete="tel"
                        id="checkout-paymentSenderPhone"
                        inputMode="tel"
                        maxLength={14}
                        onChange={(event) => update('paymentSenderPhone', event.target.value)}
                        value={values.paymentSenderPhone}
                      />
                    </FormField>
                    <FormField
                      id="checkout-transactionId"
                      label="নমুনা ট্রানজ্যাকশন ID"
                      error={errors.transactionId}
                      required
                    >
                      <input
                        id="checkout-transactionId"
                        maxLength={40}
                        onChange={(event) => update('transactionId', event.target.value)}
                        value={values.transactionId}
                      />
                    </FormField>
                  </div>
                </div>
              ) : (
                <p className="payment-cod-note">
                  <ShieldCheck aria-hidden="true" className="size-5" /> Order জমা হলে payment হবে
                  delivery-র সময়; courier service এখনো যুক্ত হয়নি।
                </p>
              )}
            </section>
          </div>

          <details className="checkout-summary" open>
            <summary>
              অর্ডারের সারাংশ <ChevronDown aria-hidden="true" className="size-4" />
            </summary>
            <div className="checkout-summary-content">
              <h2>অর্ডারের সারাংশ</h2>
              <ul className="checkout-item-list">
                {quote.items.map((item) => (
                  <li key={`${item.productId}:${item.variantLabel}`}>
                    <span>
                      <strong>{item.nameBn}</strong>
                      <small>
                        {item.quantity.toLocaleString('bn-BD')} × {formatBDT(item.price)}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                      </small>
                    </span>
                    <b>{formatBDT(item.lineTotal)}</b>
                  </li>
                ))}
              </ul>
              <div className="checkout-coupon-box">
                <label htmlFor="checkout-coupon">কুপন কোড</label>
                <div>
                  <input
                    autoComplete="off"
                    id="checkout-coupon"
                    maxLength={20}
                    onChange={(event) => setCouponDraft(event.target.value)}
                    value={couponDraft}
                  />
                  <button
                    onClick={
                      couponCode
                        ? () => {
                            setCouponCode('');
                            setCouponDraft('');
                            setCouponMessage('কুপন সরানো হয়েছে।');
                          }
                        : applyCoupon
                    }
                    type="button"
                  >
                    {couponCode ? 'সরান' : 'প্রয়োগ'}
                  </button>
                </div>
                <p
                  aria-live="polite"
                  className={quote.couponError ? 'field-error' : 'coupon-message'}
                >
                  {quote.couponError ||
                    couponMessage ||
                    (couponCode
                      ? 'Order জমা হলে backend কুপনটি যাচাই করবে।'
                      : 'যে coupon code আছে সেটি লিখুন; backend যাচাই করবে।')}
                </p>
              </div>
              <div className="cart-summary-row">
                <span>সাবটোটাল</span>
                <span>{formatBDT(quote.subtotal)}</span>
              </div>
              {quote.discount ? (
                <div className="cart-summary-row discount-row">
                  <span>কুপন ছাড়</span>
                  <span>− {formatBDT(quote.discount)}</span>
                </div>
              ) : null}
              <div className="cart-summary-row">
                <span>ডেলিভারি</span>
                <span>{quote.deliveryCharge ? formatBDT(quote.deliveryCharge) : 'ফ্রি'}</span>
              </div>
              <p className="checkout-estimate">
                আনুমানিক ডেলিভারি: {getDeliveryEstimate(values.deliveryMethod)} · final coupon ও
                total backend যাচাই করবে।
              </p>
              <div aria-live="polite" className="cart-summary-total">
                <span>আনুমানিক সর্বমোট</span>
                <strong>{formatBDT(quote.total)}</strong>
              </div>
              <p aria-live="polite" className="checkout-submit-message">
                {submitMessage}
              </p>
              <button
                className="cart-checkout-button"
                disabled={submitting || Boolean(quote.couponError)}
                type="submit"
              >
                {submitting ? 'অর্ডার পাঠানো হচ্ছে…' : 'Cash on Delivery order করুন'}{' '}
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
              <p className="checkout-safe-note">
                <ShieldCheck aria-hidden="true" className="size-4" /> Order-এর contact ও address
                backend database-এ সংরক্ষিত হবে।
              </p>
            </div>
          </details>
        </form>
      </div>
    </main>
  );
}
