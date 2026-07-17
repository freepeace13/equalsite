import type { ComponentType } from 'react';
import { str } from '@/lib/utils';
import type { IViolation } from '@/types';
import {
    BellIcon,
    Collapsible,
    CollapsibleChevron,
    CollapsibleContent,
    CollapsibleTrigger,
    EyeIcon,
    type IconProps,
    InfoCircleIcon,
    KeyboardIcon,
    PackageIcon,
    SeverityBadge,
    type SeverityBadgeSeverity,
    ZapIcon,
} from '@equalsite/ui';
import { ViolationCard } from './violation-card';

export type ImpactKey = Exclude<SeverityBadgeSeverity, 'pass'>;

const IMPACT_GROUP_LABELS: Record<ImpactKey, string> = {
    critical: 'screen reader users',
    serious: 'keyboard users',
    moderate: 'low vision users',
    minor: 'general users',
};

const IMPACT_GROUP_SUBTITLES: Record<ImpactKey, string> = {
    critical: 'missing labels and alt text block core flows',
    serious: 'focus management and keyboard navigation issues',
    moderate: 'colour contrast and text sizing falls short',
    minor: 'minor improvements for a better experience',
};

const IMPACT_GROUP_ICON: Record<ImpactKey, ComponentType<IconProps>> = {
    critical: BellIcon,
    serious: KeyboardIcon,
    moderate: EyeIcon,
    minor: InfoCircleIcon,
};

function SubSectionDivider({
    type,
    count,
}: {
    type: 'quick-wins' | 'structural-work';
    count: number;
}) {
    const isQuickWins = type === 'quick-wins';
    return (
        <div className="flex items-center gap-2 py-1">
            {isQuickWins ? (
                <ZapIcon
                    width={12}
                    height={12}
                    strokeWidth={2.5}
                    className="text-emerald-500"
                />
            ) : (
                <PackageIcon className="text-slate-400" />
            )}
            <span
                className={`text-xs font-medium ${isQuickWins ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
                {[
                    isQuickWins ? 'quick wins' : 'structural work',
                    `${count} ${str.plural('issue', count)}`,
                ].join(' · ')}
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
    );
}

export function ImpactGroup({
    impact,
    violations,
}: {
    impact: ImpactKey;
    violations: IViolation[];
}) {
    const count = violations.length;
    const quickWins = violations.filter(
        (v) => v.remediationScope === 'page-specific',
    );
    const structuralWork = violations.filter(
        (v) => v.remediationScope !== 'page-specific',
    );
    const Icon = IMPACT_GROUP_ICON[impact];

    return (
        <Collapsible
            defaultOpen={impact === 'critical'}
            className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700"
        >
            <CollapsibleTrigger className="gap-3.5 px-4 py-3.5">
                <Icon />
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                        {IMPACT_GROUP_LABELS[impact]}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                        {IMPACT_GROUP_SUBTITLES[impact]}
                    </span>
                </span>
                <SeverityBadge
                    severity={impact}
                    label={`${count} ${impact}`}
                    hideIcon
                    className="whitespace-nowrap"
                />
                <CollapsibleChevron />
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-2.5 border-t border-slate-200 p-4 dark:border-slate-800">
                {quickWins.length > 0 && (
                    <>
                        <SubSectionDivider
                            type="quick-wins"
                            count={quickWins.length}
                        />
                        {quickWins.map((v) => (
                            <ViolationCard key={v.ruleId} violation={v} />
                        ))}
                    </>
                )}
                {structuralWork.length > 0 && (
                    <>
                        <SubSectionDivider
                            type="structural-work"
                            count={structuralWork.length}
                        />
                        {structuralWork.map((v) => (
                            <ViolationCard key={v.ruleId} violation={v} />
                        ))}
                    </>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
