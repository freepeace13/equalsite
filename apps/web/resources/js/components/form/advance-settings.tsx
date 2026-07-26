import type { useForm } from '@inertiajs/react';
import {
    Collapsible,
    CollapsibleChevron,
    CollapsibleContent,
    CollapsibleTrigger,
    CrawlDepth,
    EnqueueStrategy,
    PagePattern,
    SlidersIcon,
} from '@equalsite/ui';

const CRAWL_DEPTHS = [
    { label: 'shallow', value: '1' },
    { label: 'standard', value: '3' },
    { label: 'deep', value: '5' },
];

export type AuditFormData = {
    url: string;
    crawlDepth: string;
    include: string;
    exclude: string;
    sameDomain: boolean;
    confirmedAuthorized: boolean;
};

export function AdvancedSettings({
    form,
    isPro = false,
}: {
    form: ReturnType<typeof useForm<AuditFormData>>;
    /**
     * Free-plan accounts (and signed-out visitors, who land on Free once they
     * sign up) get crawl depth locked to shallow — mirrors
     * PlanLimits::clampCrawlDepth, which enforces the same limit server-side
     * regardless of what this UI allows.
     */
    isPro?: boolean;
}) {
    const crawlDepthOptions = CRAWL_DEPTHS.map((depth) => ({
        ...depth,
        disabled: !isPro && depth.value !== '1',
        lockedReason: 'deeper crawls require the Pro plan',
    }));

    return (
        <Collapsible className="mx-auto mt-6 max-w-md overflow-hidden rounded-lg border border-slate-200 text-left dark:border-slate-800">
            <CollapsibleTrigger>
                <SlidersIcon className="text-slate-500 dark:text-slate-400" />
                <span className="flex-1 text-sm font-medium">
                    advanced settings
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                    optional
                </span>
                <CollapsibleChevron />
            </CollapsibleTrigger>

            <CollapsibleContent className="border-t border-slate-200 px-4 pt-1 pb-4 dark:border-slate-800">
                <CrawlDepth
                    options={crawlDepthOptions}
                    value={form.data.crawlDepth}
                    onValueChange={(value) => {
                        form.setData('crawlDepth', value);
                    }}
                />
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    standard follows links up to 3 levels from the homepage.
                </p>
                <PagePattern
                    label="include only pages matching"
                    id="include-patterns"
                    placeholder="/blog/*, /products/*"
                    name="include"
                    value={form.data.include}
                    onValueChange={(value) => form.setData('include', value)}
                />

                <PagePattern
                    label="exclude pages matching"
                    id="exclude-patterns"
                    placeholder="/admin/*, /account/*"
                    name="exclude"
                    value={form.data.exclude}
                    onValueChange={(value) => form.setData('exclude', value)}
                />
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    leave blank to crawl your whole site, up to 25 pages.
                </p>
                <EnqueueStrategy
                    value={form.data.sameDomain}
                    onValueChange={(value) => {
                        form.setData('sameDomain', value);
                    }}
                />
            </CollapsibleContent>
        </Collapsible>
    );
}
