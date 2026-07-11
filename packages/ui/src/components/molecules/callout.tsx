import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const calloutVariants = cva(
  'flex items-start gap-2.5 rounded-lg border px-4 py-3.5 text-xs',
  {
    variants: {
      variant: {
        neutral:
          'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400',
        danger:
          'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-400',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

const CALLOUT_ICON: Record<'neutral' | 'danger' | 'success' | 'warning', React.ReactNode> = {
  neutral: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v4M12 17h.01M10.3 3.9L2.5 18a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    </svg>
  ),
};

export type CalloutVariant = 'neutral' | 'danger' | 'success' | 'warning';

export interface CalloutProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  variant?: CalloutVariant;
  /** Bold lead-in text before the description, e.g. "Scan failed." */
  title?: string;
  /** Hide the leading icon. */
  hideIcon?: boolean;
  icon?: React.ReactNode;
}

function Callout({
  variant = 'neutral',
  title,
  hideIcon = false,
  icon,
  className,
  children,
  ...props
}: CalloutProps) {
  return (
    <div
      data-slot="callout"
      className={cn(calloutVariants({ variant }), className)}
      {...props}
    >
      {!hideIcon && (
        <span className="mt-0.5 size-3.5 shrink-0 [&_svg]:size-3.5">
          {icon ?? CALLOUT_ICON[variant]}
        </span>
      )}
      <p>
        {title && <span className="font-medium">{title} </span>}
        {children}
      </p>
    </div>
  );
}

export { Callout, calloutVariants };
