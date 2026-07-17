import { cn } from '../../lib/utils';

export interface CrawlDepthOption {
  label: string;
  value: string;
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
        {options.map((depth) => (
          <label key={depth.value} className="flex-1">
            <input
              type="radio"
              name="depth"
              value={depth.value}
              checked={value === depth.value}
              onChange={() => onValueChange(depth.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'block cursor-pointer rounded-lg py-2 text-center text-xs text-slate-500 peer-checked:bg-white peer-checked:font-medium peer-checked:text-slate-900 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-600 dark:text-slate-400 dark:peer-checked:bg-slate-700 dark:peer-checked:text-white',
              )}
            >
              {depth.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export { CrawlDepth };
