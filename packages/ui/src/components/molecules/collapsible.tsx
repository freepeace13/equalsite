import * as React from 'react';

import { cn } from '../../lib/utils';

interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  contentId: string;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error('Collapsible.* components must be used within <Collapsible>');
  }
  return ctx;
}

export interface CollapsibleProps extends React.ComponentProps<'div'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Collapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const contentId = React.useId();

  const toggle = React.useCallback(() => {
    const next = !open;
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }, [open, isControlled, onOpenChange]);

  const value = React.useMemo(() => ({ open, toggle, contentId }), [open, toggle, contentId]);

  return (
    <CollapsibleContext.Provider value={value}>
      <div data-slot="collapsible" {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

export type CollapsibleTriggerProps = React.ComponentProps<'button'>;

function CollapsibleTrigger({ className, children, ...props }: CollapsibleTriggerProps) {
  const { open, toggle, contentId } = useCollapsibleContext();
  return (
    <button
      type="button"
      data-slot="collapsible-trigger"
      aria-expanded={open}
      aria-controls={contentId}
      onClick={toggle}
      className={cn(
        'flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-slate-50 focus:ring-2 focus:ring-indigo-600 focus:outline-none focus:ring-inset dark:hover:bg-slate-800/40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export type CollapsibleContentProps = React.ComponentProps<'div'>;

function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps) {
  const { open, contentId } = useCollapsibleContext();
  return (
    <div
      id={contentId}
      data-slot="collapsible-content"
      className={cn(
        'grid transition-[grid-template-rows] duration-200 ease-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
    >
      <div className="overflow-hidden">
        <div className={className} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
}

export type CollapsibleChevronProps = React.ComponentProps<'svg'>;

function CollapsibleChevron({ className, ...props }: CollapsibleChevronProps) {
  const { open } = useCollapsibleContext();
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn(
        'shrink-0 text-slate-400 transition-transform duration-200',
        open && 'rotate-180',
        className,
      )}
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent, CollapsibleChevron };
