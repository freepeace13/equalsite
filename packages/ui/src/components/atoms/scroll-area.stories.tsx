import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScrollArea } from './scroll-area';

const meta = {
  title: 'Atoms/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-48 w-64 rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="p-4 text-sm">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="py-1">
            Row {i + 1}
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};
