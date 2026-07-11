import type React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CodeBlock } from '@equalsite/ui';
import { impactToneClasses } from './reportColors';
import type { IViolation } from '@/types';
import { ClusterShell } from './cluster-shell';

type RemediationClustersProps = {
    violations: IViolation[];
};

function titleForScope(scope: string): string {
    switch (scope) {
        case 'shared-layout':
            return 'Likely shared layout fix';
        case 'shared-component':
            return 'Likely shared component fix';
        case 'template':
            return 'Likely shared template fix';
        case 'page-specific':
            return 'Likely page-specific fix';
        default:
            return 'Needs developer review';
    }
}

function renderBoldSegments(
    text: string,
): Array<React.ReactNode> {
    const parts: Array<React.ReactNode> = [];
    const pattern = /\*\*(.+?)\*\*/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        const matchIndex = match.index;
        const fullMatch = match[0];
        const boldText = match[1];

        if (matchIndex > cursor) {
            parts.push(text.slice(cursor, matchIndex));
        }

        parts.push(
            <strong
                key={`bold-${matchIndex}`}
                className="font-semibold dark:text-slate-900 text-slate-100"
            >
                {boldText}
            </strong>,
        );

        cursor = matchIndex + fullMatch.length;
    }

    if (cursor < text.length) {
        parts.push(text.slice(cursor));
    }

    return parts;
}

export function RemediationClusters({
    violations,
}: RemediationClustersProps) {
    return (
        <div className="grid gap-4 grid-cols-0">
            <div className="space-y-2">
                {violations.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Fix priorities</CardTitle>
                            <CardDescription>No remediation clusters are available yet.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm dark:text-slate-600 text-slate-300">
                            Re-run the audit after page analysis completes to
                            unlock issue clustering and developer evidence.
                        </CardContent>
                    </Card>
                ) : (
                    violations.map((i) => (
                        <ClusterShell
                            key={`cluster-${i.ruleId}`}
                            title={
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="min-w-0 wrap-break-words whitespace-normal">
                                            {i.summary}
                                        </span>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ring-1 ${impactToneClasses(i.impact)}`}
                                        >
                                            {i.impact.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-sm dark:text-slate-600 text-slate-300">
                                        {titleForScope(i.remediationScope)}
                                    </div>
                                </div>
                            }
                            description={`${i.affectedPagesCount} pages impacted · ${i.instancesCount} unique instances`}
                        >
                            <CardContent className="text-sm dark:text-slate-600 text-slate-300">
                                <div className="space-y-4">
                                    <div className="text-sm dark:text-slate-600 text-slate-300">
                                        {renderBoldSegments(i.clusterReason)}
                                    </div>

                                    {i.failureSummary ? (
                                        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                                            {renderBoldSegments(i.failureSummary)}
                                        </div>
                                    ) : null}

                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold tracking-wide dark:text-slate-500 uppercase text-slate-400">
                                                Where to start
                                            </div>
                                            {i.nodes.length > 0 ? (
                                                i.nodes.map(
                                                    (node) => (
                                                        <div
                                                            key={`${i.ruleId}-${node.fingerprint}-target`}
                                                            className="rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                        >
                                                            {node.target}
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-sm dark:text-slate-600 text-slate-300">
                                                    No selector evidence available
                                                    yet.
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold tracking-wide dark:text-slate-500 text-slate-400 uppercase">
                                                HTML evidence
                                            </div>
                                            {i.nodes.length > 0 ?
                                                i.nodes.map(node => (
                                                    <CodeBlock
                                                        key={`${i.ruleId}-${node.fingerprint}-html`}
                                                        code={node.html}
                                                        label="HTML evidence"
                                                        maxHeightClassName="max-h-44"
                                                        enableHorizontalScroll={false}
                                                        className="bg-black dark:bg-slate-950 text-slate-100"
                                                    />
                                                ))
                                            : (
                                                <p className="text-sm dark:text-slate-600 text-slate-300">
                                                    No HTML evidence available yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div>
                                            <div className="text-xs font-semibold tracking-wide dark:text-slate-500 uppercase text-slate-400">
                                                Affected pages
                                            </div>
                                            <ul className="mt-2 space-y-2">
                                                {i.nodes.flatMap(v => v.urls)
                                                    .slice(0, 6)
                                                    .map((page, k) => (
                                                        <li
                                                            key={`${i.ruleId}-${page}-${k}`}
                                                            className="truncate rounded-md border dark:border-slate-200 px-3 py-2 text-sm dark:text-slate-700 border-slate-800 text-slate-200"
                                                            title={page}
                                                        >
                                                            {page}
                                                        </li>
                                                    ))}
                                            </ul>
                                            {i.nodes.flatMap(v => v.urls).length > 6 ? (
                                                <div className="mt-2 text-xs dark:text-slate-500 text-slate-400">
                                                    +
                                                    {i.nodes.flatMap(v => v.urls).length - 6}{' '}
                                                    more pages affected
                                                </div>
                                            ) : null}
                                        </div>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Fix instruction</CardTitle>
                                                <CardDescription>
                                                    {i.fixInstruction ?? 'AI-generated remediation guidance will turn this evidence into a developer-friendly fix brief.'}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </ClusterShell>
                    ))
                )}
            </div>
        </div>
    );
}
