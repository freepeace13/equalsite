import type { Meta, StoryObj } from '@storybook/react-vite';

import { MetricCard } from './metric-card';

const meta = {
  title: 'UI/MetricCard',
  component: MetricCard,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['default', 'warning', 'success'] },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'pages scanned', value: 14 },
};

export const Warning: Story = {
  args: { label: 'issues found so far', value: 31, tone: 'warning' },
};

export const Success: Story = {
  args: { label: 'quick wins', value: '6 fixes', tone: 'success' },
};

export const Grid: Story = {
  args: { label: 'pages found', value: 22 },
  render: () => (
    <div className="grid w-[420px] grid-cols-3 gap-3">
      <MetricCard label="pages found" value={22} />
      <MetricCard label="pages scanned" value={14} />
      <MetricCard label="issues found so far" value={31} tone="warning" />
    </div>
  ),
};
