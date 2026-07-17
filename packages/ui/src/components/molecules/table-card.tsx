import * as React from 'react';

import { cn } from '../../lib/utils';
import { surfacePanelVariants } from './surface-panel';

export type TableCardProps = React.ComponentProps<'div'>;

function TableCard({ className, ...props }: TableCardProps) {
  return (
    <div
      data-slot="table-card"
      className={cn(surfacePanelVariants({ padding: 'none' }), 'overflow-hidden', className)}
      {...props}
    />
  );
}

export { TableCard };
