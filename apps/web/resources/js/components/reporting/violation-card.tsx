import { str } from '@/lib/utils';
import type { IViolation } from '@/types';
import {
    ClockIcon,
    FileTextIcon,
    ImagePlaceholderIcon,
    SeverityBadge,
    type SeverityBadgeSeverity,
} from '@equalsite/ui';

export function ViolationCard({ violation }: { violation: IViolation }) {
    const impact = violation.impact as SeverityBadgeSeverity;

    return (
        <article className="flex gap-3.5 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <ImagePlaceholderIcon className="text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium">{violation.summary}</h3>
                    <SeverityBadge severity={impact} className="shrink-0" />
                </div>
                {violation.failureSummary && (
                    <p className="mt-1 mb-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {violation.failureSummary}
                    </p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                        <FileTextIcon />
                        {violation.affectedPagesCount}{' '}
                        {str.plural('page', violation.affectedPagesCount)}
                    </span>
                    {violation.helpUrl && (
                        <a
                            href={violation.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            <ClockIcon />
                            ~5 min fix
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
