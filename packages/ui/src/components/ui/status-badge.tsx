import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      status: {
        queued: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        processing:
          'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
        complete:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      },
    },
    defaultVariants: {
      status: 'queued',
    },
  },
);

export type StatusBadgeStatus =
  | 'queued'
  | 'processing'
  | 'complete'
  | 'cancelled'
  | 'failed';

const STATUS_ICON: Record<StatusBadgeStatus, React.ReactNode> = {
  queued: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  processing: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 11-3.5-7.1" />
    </svg>
  ),
  complete: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  cancelled: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  failed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
};

const STATUS_LABEL: Record<StatusBadgeStatus, string> = {
  queued: 'queued',
  processing: 'processing',
  complete: 'complete',
  cancelled: 'cancelled',
  failed: 'failed',
};

export interface StatusBadgeProps
  extends Omit<React.ComponentProps<'span'>, 'children'> {
  status: StatusBadgeStatus;
  /** Override the default label text (e.g. "crawling" instead of "processing"). */
  label?: string;
}

function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {STATUS_ICON[status]}
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
