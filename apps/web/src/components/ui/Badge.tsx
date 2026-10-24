import type { HTMLAttributes } from 'react';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'fresh' | 'sale' | 'neutral';
};

const tones = {
  fresh: 'border-haat-green bg-haat-green text-white',
  sale: 'border-haat-brick bg-haat-brick text-white',
  neutral: 'border-haat-marigold bg-haat-marigold text-haat-charcoal',
};

export function Badge({ tone = 'fresh', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex -rotate-2 items-center rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] shadow-[2px_2px_0_rgba(31,31,31,0.18)] ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
