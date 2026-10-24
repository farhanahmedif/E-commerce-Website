type PriceTagProps = {
  price: number;
  previousPrice?: number;
  className?: string;
};

const taka = new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 });

export function PriceTag({ price, previousPrice, className = '' }: PriceTagProps) {
  return (
    <span
      className={`tag-cut inline-flex rotate-[-1deg] flex-col bg-haat-marigold px-3 py-1.5 text-haat-charcoal shadow-[2px_3px_0_rgba(31,31,31,0.25)] ${className}`}
    >
      <span className="font-display text-lg font-bold leading-tight">৳ {taka.format(price)}</span>
      {previousPrice !== undefined ? (
        <span className="text-xs line-through opacity-70">৳ {taka.format(previousPrice)}</span>
      ) : null}
    </span>
  );
}
