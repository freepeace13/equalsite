import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlaceholderPattern } from './placeholder-pattern';

const meta = {
  title: 'Atoms/PlaceholderPattern',
  component: PlaceholderPattern,
  tags: ['autodocs'],
} satisfies Meta<typeof PlaceholderPattern>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="h-40 w-64 overflow-hidden rounded-lg border border-slate-200 stroke-slate-300 dark:border-slate-800 dark:stroke-slate-700">
      <PlaceholderPattern className="size-full" />
    </div>
  ),
};
