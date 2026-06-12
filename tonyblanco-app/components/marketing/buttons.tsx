import Link from 'next/link';
import { cn } from '@/lib/utils';

type MarketingButtonProps = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline-gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
};

const sizeClasses = {
  sm: 'px-[18px] py-2.5 text-sm',
  md: 'px-7 py-4 text-base',
  lg: 'px-9 py-4 text-base',
};

export function MarketingButton({
  href,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled,
  ariaLabel,
}: MarketingButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-[transform,box-shadow,border-color,background-color] duration-150 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ha-acc)] disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary:
      'border-0 bg-[var(--ha-grad)] font-bold text-[var(--ha-acc-ink)] shadow-[0_10px_30px_var(--ha-btn-glow)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
    secondary:
      'border border-[var(--ha-line-soft)] bg-white/[0.04] text-[var(--ha-ink)] hover:border-[var(--ha-acc)]',
    ghost:
      'border border-[var(--ha-line-soft)] bg-transparent text-[var(--ha-ink)] hover:border-[var(--ha-acc)]',
    'outline-gold':
      'border border-[var(--ha-acc)] bg-transparent font-bold text-[var(--ha-acc)] hover:bg-[var(--ha-grad)] hover:text-[var(--ha-acc-ink)] hover:border-transparent',
  };

  const classes = cn(base, sizeClasses[size], variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}