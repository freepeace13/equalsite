import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const surfacePanelVariants = cva('rounded-lg border border-slate-200 dark:border-slate-800', {
  variants: {
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-10',
    },
  },
  defaultVariants: {
    padding: 'none',
  },
});

export interface SurfacePanelProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof surfacePanelVariants> {}

function SurfacePanel({ className, padding, ...props }: SurfacePanelProps) {
  return (
    <div
      data-slot="surface-panel"
      className={cn(surfacePanelVariants({ padding }), className)}
      {...props}
    />
  );
}

export { SurfacePanel, surfacePanelVariants };
