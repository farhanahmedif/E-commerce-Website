import Link from 'next/link';
import { Container } from '@/components/ui/Container';
export default function NotFound() {
  return (
    <main className="listing-empty not-found-page">
      <Container>
        <span aria-hidden="true" className="empty-market-mark">
          ?
        </span>
        <p className="listing-eyebrow">দোকানদারকে জিজ্ঞেস করেও পেলাম না</p>
        <h1>এই পসরা হাটে নেই!</h1>
        <p>ঠিকানাটি হয়তো বদলে গেছে। হাটের অন্য দোকানে ঘুরে দেখুন।</p>
        <div className="not-found-links">
          <Link href="/products">সব পণ্য দেখুন</Link>
          <Link href="/">হোমে ফিরুন</Link>
        </div>
      </Container>
    </main>
  );
}
