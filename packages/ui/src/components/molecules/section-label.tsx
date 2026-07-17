import * as React from 'react';

import { cn } from '../../lib/utils';

export interface SectionLabelProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  children: React.ReactNode;
  /** Rendered on the right, e.g. a "view all" link. */
  action?: React.ReactNode;
}

function SectionLabel({ children, action, className, ...props }: SectionLabelProps) {
  if (!action) {
    return (
      <p
        data-slot="section-label"
        className={cn('text-xs text-slate-400 dark:text-slate-500', className)}
        {...props}
      >
        {children}
      </p>
    );
  }

  return (
    <div
      data-slot="section-label"
      className={cn('flex items-end justify-between gap-4', className)}
      {...props}
    >
      <p className="text-xs text-slate-400 dark:text-slate-500">{children}</p>
      {action}
    </div>
  );
}

export { SectionLabel };
