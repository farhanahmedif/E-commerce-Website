import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  children: ReactNode;
  description?: string;
};

export function SectionHeading({ eyebrow, children, description }: SectionHeadingProps) {
  return (
    <div className="mb-7 max-w-2xl sm:mb-9">
      {eyebrow ? (
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-haat-brick">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="signboard inline-block px-5 py-3 font-display text-2xl font-bold leading-tight text-haat-green sm:text-3xl">
        {children}
      </h2>
      {description ? (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-haat-muted">{description}</p>
      ) : null}
    </div>
  );
}
