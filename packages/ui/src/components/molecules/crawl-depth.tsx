import { Fragment } from 'react';
import { cn } from '../../lib/utils';
import { LockIcon } from '../atoms/icons/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '../atoms/tooltip';

export interface CrawlDepthOption {
  label: string;
  value: string;
  /** Disables the option (e.g. a plan doesn't allow this depth). Selecting it is prevented client-side only — callers must still enforce the limit server-side. */
  disabled?: boolean;
  /** Tooltip shown on a disabled option. Defaults to a generic upgrade hint. */
  lockedReason?: string;
}

export interface CrawlDepthProps {
  label?: string;
  options: CrawlDepthOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

function CrawlDepth({ label, options, value, onValueChange, className }: CrawlDepthProps) {
  return (
    <div data-slot="crawl-depth" className={className}>
      <label className="mt-4 mb-2 block text-xs font-medium">{label ?? 'crawl depth'}</label>
      <div
        role="radiogroup"
        aria-label="Crawl depth"
        className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/60"
      >
        {options.map((depth) => {
          const option = (
            <label className="flex-1">
              <input
                type="radio"
                name="depth"
                value={depth.value}
                checked={value === depth.value}
                disabled={depth.disabled}
                onChange={() => onValueChange(depth.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex items-center justify-center gap-1 rounded-lg py-2 text-center text-xs text-slate-500 peer-checked:bg-white peer-checked:font-medium peer-checked:text-slate-900 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-600 dark:text-slate-400 dark:peer-checked:bg-slate-700 dark:peer-checked:text-white',
                  depth.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                )}
              >
                {depth.label}
                {depth.disabled && <LockIcon aria-hidden="true" />}
              </span>
            </label>
          );

          if (!depth.disabled) {
            return <Fragment key={depth.value}>{option}</Fragment>;
          }

          return (
            <Tooltip key={depth.value}>
              <TooltipTrigger asChild>{option}</TooltipTrigger>
              <TooltipContent>{depth.lockedReason ?? 'requires the Pro plan'}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

export { CrawlDepth };
