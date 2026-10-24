import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

const quickLinks = ['আমাদের কথা', 'সব ক্যাটাগরি', 'আজকের অফার', 'বিক্রেতা হোন'];
const serviceLinks = ['যোগাযোগ করুন', 'ডেলিভারি তথ্য', 'রিটার্ন ও রিফান্ড', 'সাধারণ জিজ্ঞাসা'];

function FooterLinks({ links }: { links: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {links.map((link) => (
        <li key={link}>
          <Link className="text-sm text-white/75 transition hover:text-haat-marigold" href="#">
            {link}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-haat-green-deep text-white">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link className="font-display text-3xl font-bold" href="/">
              <span className="text-haat-marigold">হাট</span>Go
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
              গ্রামের হাটের আপন আমেজ, এখন আপনার হাতের মুঠোয়। সারা বাংলাদেশের সেরা পণ্য এক ঠিকানায়।
            </p>
            <div aria-label="Social media" className="mt-5 flex gap-2">
              <a
                aria-label="Facebook"
                className="grid size-10 place-items-center rounded-full border border-white/30 text-sm font-bold transition hover:border-haat-marigold hover:text-haat-marigold"
                href="https://www.facebook.com/"
              >
                f
              </a>
              <a
                aria-label="Instagram"
                className="grid size-10 place-items-center rounded-full border border-white/30 text-xs font-bold transition hover:border-haat-marigold hover:text-haat-marigold"
                href="https://www.instagram.com/"
              >
                ig
              </a>
              <a
                aria-label="YouTube"
                className="grid size-10 place-items-center rounded-full border border-white/30 text-[10px] font-bold transition hover:border-haat-marigold hover:text-haat-marigold"
                href="https://www.youtube.com/"
              >
                yt
              </a>
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-haat-marigold">দরকারি লিংক</h2>
            <FooterLinks links={quickLinks} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-haat-marigold">কাস্টমার সার্ভিস</h2>
            <FooterLinks links={serviceLinks} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-haat-marigold">নিরাপদ পেমেন্ট</h2>
            <p className="mt-4 text-sm text-white/75">আপনার পছন্দের মাধ্যমে পেমেন্ট করুন</p>
            <div aria-label="Available payment methods" className="mt-3 flex flex-wrap gap-2">
              {['bKash', 'Nagad', 'Rocket', 'কার্ড', 'COD'].map((method) => (
                <span
                  className="rounded border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-bold"
                  key={method}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="font-display text-lg font-bold text-haat-marigold">হাটের খবর নিন</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              নতুন অফার আর হাটের গল্প পৌঁছে যাবে আপনার ইনবক্সে।
            </p>
            <form action="#" className="mt-3 flex flex-col gap-2">
              <label className="sr-only" htmlFor="newsletter-email">
                ইমেইল ঠিকানা
              </label>
              <input
                autoComplete="email"
                className="h-11 min-w-0 rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white placeholder:text-white/55 focus:border-haat-marigold focus:outline-none"
                id="newsletter-email"
                name="email"
                placeholder="আপনার ইমেইল"
                type="email"
              />
              <Button className="w-full" type="submit">
                সাবস্ক্রাইব করুন
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/20 pt-5 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© ২০২৬ হাটGo। সর্বস্বত্ব সংরক্ষিত।</p>
          <p>বাংলাদেশের হাট, আপনার ঘরে।</p>
        </div>
      </Container>
    </footer>
  );
}
