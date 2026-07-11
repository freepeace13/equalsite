import * as React from 'react';

import { cn } from '../../lib/utils';

export interface StatPairItem {
  value: React.ReactNode;
  label: string;
}

export interface StatPairProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  items: [StatPairItem, StatPairItem];
}

function StatPair({ items, className, ...props }: StatPairProps) {
  return (
    <div
      data-slot="stat-pair"
      className={cn(
        'flex items-center justify-center gap-8 rounded-lg bg-slate-100 py-7 dark:bg-slate-800/60',
        className,
      )}
      {...props}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <div className="h-10 w-px bg-slate-300 dark:bg-slate-700" />}
          <div className="text-center">
            <p className="text-3xl leading-none font-medium">{item.value}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export { StatPair };
