import { Container } from '@/components/ui/Container';

export function AnnouncementBar() {
  return (
    <div className="bg-haat-green py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
      <Container className="flex items-center justify-center gap-2">
        <span className="text-haat-marigold" aria-hidden="true">
          ✳
        </span>
        <p>পরীক্ষামূলক storefront: checkout-এর অর্ডার বিক্রেতার কাছে যায় না</p>
        <span className="hidden text-haat-marigold sm:inline" aria-hidden="true">
          ✳
        </span>
      </Container>
    </div>
  );
}
