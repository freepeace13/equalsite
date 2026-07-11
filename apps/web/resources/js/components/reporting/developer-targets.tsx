import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@equalsite/ui';
import type { Remediation } from '@/types';
import { impactToneClasses } from './reportColors';

type RemediationGroup = NonNullable<Remediation>['groups'][number];

type DeveloperTargetsProps = {
    groups: RemediationGroup[];
};

function truncateHtmlSnippet(html: string): string {
    const compact = html.replace(/\s+/g, ' ').trim();

    if (compact.length <= 180) {
        return compact;
    }

    return `${compact.slice(0, 177)}...`;
}

export function DeveloperTargets({
    groups,
}: DeveloperTargetsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Developer targets</CardTitle>
                <CardDescription>Selector and HTML evidence to help trace each issue back to shared layouts or page-specific markup.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {groups.length === 0 ? (
                    <p className="text-sm dark:text-slate-600 text-slate-300">
                        No developer evidence is available yet for this report.
                    </p>
                ) : (
                    groups.map((group, index) => (
                        <div
                            key={`developer-target-${group.violationId}`}
                            className="rounded-lg border dark:border-slate-200 p-4 border-slate-800"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="dark:text-slate-900 font-semibold text-slate-100">
                                        Cluster {index + 1} of {groups.length}:{' '}
                                        {group.summary}
                                    </div>
                                    <div className="mt-1 text-sm dark:text-slate-600 text-slate-300">
                                        {group.clusterReason}
                                    </div>
                                </div>
                                <span
                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ring-1 ${impactToneClasses(group.impact)}`}
                                >
                                    {group.impactLabel}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold tracking-wide dark:text-slate-500 text-slate-400">
                                        Representative selectors
                                    </div>
                                    {group.sampleTargets.map((target) => (
                                        <div
                                            key={`${group.violationId}-${target}`}
                                            className="rounded-md dark:bg-slate-100 px-3 py-2 font-mono text-xs dark:text-slate-700 bg-slate-800 text-slate-200"
                                        >
                                            {target}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs font-semibold tracking-wide dark:text-slate-500 text-slate-400 uppercase">
                                        HTML snippet
                                    </div>
                                    {group.sampleNodes[0] ? (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>HTML snippet</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {truncateHtmlSnippet(group.sampleNodes[0].html)}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <p className="text-sm dark:text-slate-600 text-slate-300">
                                            No HTML snippet captured for this
                                            issue.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            </CardContent>
        </Card>
    );
}
