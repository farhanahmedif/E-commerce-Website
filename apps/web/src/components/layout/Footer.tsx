import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { FooterNewsletterForm } from './FooterNewsletterForm';

const quickLinks = [
  { label: 'আমাদের কথা', href: '/#our-story' },
  { label: 'সব ক্যাটাগরি', href: '/#shops' },
  { label: 'আজকের অফার', href: '/products?onSale=true' },
];
const serviceLinks = [
  { label: 'অর্ডার ট্র্যাক করুন', href: '/track-order' },
  { label: 'আমার অর্ডার', href: '/account/orders' },
];

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            className="text-sm text-white/75 transition hover:text-haat-marigold"
            href={link.href}
          >
            {link.label}
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
            <p className="mt-5 text-sm text-white/65">সামাজিক পেজের লিংক শিগগির যোগ হবে।</p>
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
            <h2 className="font-display text-lg font-bold text-haat-marigold">পেমেন্ট ও অর্ডার</h2>
            <p className="mt-4 text-sm text-white/75">
              শুধু নমুনা COD flow দেখা যায়; কোনো পেমেন্ট বা delivery হয় না।
            </p>
            <div aria-label="Available payment methods" className="mt-3 flex flex-wrap gap-2">
              {['COD demo', 'Online payment বন্ধ'].map((method) => (
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
            <FooterNewsletterForm />
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
