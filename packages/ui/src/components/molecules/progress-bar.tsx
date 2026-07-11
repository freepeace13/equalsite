import * as React from 'react';

import { cn } from '../../lib/utils';

export interface ProgressBarProps extends React.ComponentProps<'div'> {
  /** 0-100 */
  value: number;
  /** Track/fill thickness. `sm` matches inline card progress, `default` matches full-page progress. */
  size?: 'sm' | 'default';
  'aria-label'?: string;
}

function ProgressBar({
  value,
  size = 'default',
  className,
  'aria-label': ariaLabel,
  ...props
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      data-slot="progress-bar"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn(
        'overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-indigo-700 transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { ProgressBar };
