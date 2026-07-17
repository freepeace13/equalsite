import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../atoms/button';
import { CheckIcon } from '../atoms/icons/icons';
import { EmptyState } from './empty-state';

const meta = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'no audits yet',
    description: "run one above and it'll show up here, along with the rest of your audit history.",
  },
};

export const WithAction: Story = {
  args: {
    title: 'no sites yet',
    description: "run your first audit and it'll show up here, grouped with the rest of that site's history.",
    action: (
      <Button size="sm" className="mx-auto">
        run your first audit
      </Button>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    title: 'no issues found',
    description: 'great news — this site passed all WCAG 2.2 AA checks.',
    icon: (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
        <CheckIcon className="text-emerald-600 dark:text-emerald-400" />
      </div>
    ),
    className: 'p-8',
  },
};
