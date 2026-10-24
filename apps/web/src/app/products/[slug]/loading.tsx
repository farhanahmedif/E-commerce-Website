import { Container } from '@/components/ui/Container';
export default function ProductLoading() {
  return (
    <main className="product-detail-page">
      <Container>
        <div className="skeleton-line skeleton-breadcrumb" />
        <div className="product-loading-grid">
          <div className="skeleton-image" />
          <div>
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
            <div className="skeleton-image small" />
          </div>
        </div>
      </Container>
    </main>
  );
}
