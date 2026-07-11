import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const metricCardVariants = cva('rounded-lg p-4', {
  variants: {
    tone: {
      default: 'bg-slate-100 dark:bg-slate-800/60',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20',
      success: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});

const metricCardLabelVariants = cva('mb-1 text-xs', {
  variants: {
    tone: {
      default: 'text-slate-500 dark:text-slate-400',
      warning: 'text-yellow-700 dark:text-yellow-400',
      success: 'text-emerald-700 dark:text-emerald-400',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});

const metricCardValueVariants = cva('text-xl font-medium', {
  variants: {
    tone: {
      default: '',
      warning: 'text-yellow-700 dark:text-yellow-400',
      success: 'text-emerald-700 dark:text-emerald-400',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});

export type MetricCardTone = 'default' | 'warning' | 'success';

export interface MetricCardProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  label: string;
  value: React.ReactNode;
  tone?: MetricCardTone;
}

function MetricCard({ label, value, tone = 'default', className, ...props }: MetricCardProps) {
  return (
    <div
      data-slot="metric-card"
      className={cn(metricCardVariants({ tone }), className)}
      {...props}
    >
      <p className={cn(metricCardLabelVariants({ tone }))}>{label}</p>
      <p className={cn(metricCardValueVariants({ tone }))}>{value}</p>
    </div>
  );
}

export { MetricCard, metricCardVariants };
