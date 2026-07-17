import * as React from 'react';

import { cn } from '../../lib/utils';

export interface EmptyStateProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Rendered above the title, e.g. an icon in a colored circle. */
  icon?: React.ReactNode;
  /** Rendered below the description, e.g. a CTA button. */
  action?: React.ReactNode;
}

function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn('rounded-lg border border-slate-200 p-10 text-center dark:border-slate-800', className)}
      {...props}
    >
      {icon && <div className="mx-auto mb-3 flex justify-center">{icon}</div>}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export { EmptyState };
