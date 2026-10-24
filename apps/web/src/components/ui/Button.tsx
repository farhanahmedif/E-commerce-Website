import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-haat-green text-white shadow-[3px_3px_0_var(--green-deep)] hover:-translate-y-0.5 hover:shadow-[4px_5px_0_var(--green-deep)]',
  secondary:
    'border-2 border-haat-green bg-haat-paper text-haat-green shadow-[3px_3px_0_var(--green)] hover:bg-white',
  ghost: 'text-haat-green hover:bg-haat-green/10',
};

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 font-semibold transition duration-200 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      type={type}
      {...props}
    />
  );
}
