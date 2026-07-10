import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const severityBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      severity: {
        critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        serious:
          'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        moderate:
          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
        minor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        pass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      },
    },
    defaultVariants: {
      severity: 'minor',
    },
  },
);

export type SeverityBadgeSeverity =
  | 'critical'
  | 'serious'
  | 'moderate'
  | 'minor'
  | 'pass';

const SEVERITY_ICON: Record<SeverityBadgeSeverity, React.ReactNode> = {
  critical: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  ),
  serious: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
    </svg>
  ),
  moderate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  minor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  pass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
};

export interface SeverityBadgeProps
  extends Omit<React.ComponentProps<'span'>, 'children'> {
  severity: SeverityBadgeSeverity;
  /** Override the default label text (defaults to the severity name). */
  label?: string;
  /** Hide the leading icon. Severity should still be paired with text — never color alone. */
  hideIcon?: boolean;
}

function SeverityBadge({
  severity,
  label,
  hideIcon = false,
  className,
  ...props
}: SeverityBadgeProps) {
  return (
    <span
      data-slot="severity-badge"
      className={cn(severityBadgeVariants({ severity }), className)}
      {...props}
    >
      {!hideIcon && SEVERITY_ICON[severity]}
      {label ?? severity}
    </span>
  );
}

export { SeverityBadge, severityBadgeVariants };
