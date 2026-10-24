import { Container } from '@/components/ui/Container';

export default function ProductsLoading() {
  return (
    <main aria-label="পণ্য লোড হচ্ছে" className="listing-page">
      <Container>
        <div className="skeleton-line skeleton-breadcrumb" />
        <div className="skeleton-line skeleton-title" />
        <div className="listing-layout">
          <div className="listing-sidebar skeleton-filter" />
          <div className="listing-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div aria-hidden="true" className="product-skeleton" key={index}>
                <div className="skeleton-image" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
