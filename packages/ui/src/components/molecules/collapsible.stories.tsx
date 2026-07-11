import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Collapsible,
  CollapsibleChevron,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';
import { SeverityBadge } from './severity-badge';

const meta = {
  title: 'Molecules/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AdvancedSettings: Story = {
  render: () => (
    <div className="w-[380px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <Collapsible>
        <CollapsibleTrigger>
          <span className="flex-1 text-sm font-medium">advanced settings</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">optional</span>
          <CollapsibleChevron />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-slate-200 px-4 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          crawl depth, include/exclude patterns, and same-domain toggle live here.
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};

export const ImpactGroup: Story = {
  render: () => (
    <div className="w-[420px] overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="gap-3.5 py-3.5">
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">screen reader users</span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              missing labels and alt text block core flows
            </span>
          </span>
          <SeverityBadge severity="critical" label="4 critical" />
          <CollapsibleChevron />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2.5 border-t border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            violation list renders here.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};
