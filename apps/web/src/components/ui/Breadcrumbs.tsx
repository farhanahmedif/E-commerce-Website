import Link from 'next/link';

export type BreadcrumbItem = { label: string; href?: string };
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {index > 0 ? (
              <span aria-hidden="true" className="breadcrumb-separator">
                /
              </span>
            ) : null}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
