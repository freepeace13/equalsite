import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusBadge } from './status-badge';

const meta = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['queued', 'processing', 'complete', 'cancelled', 'failed'],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Queued: Story = {
  args: { status: 'queued' },
};

export const Processing: Story = {
  args: { status: 'processing' },
};

export const Complete: Story = {
  args: { status: 'complete' },
};

export const Cancelled: Story = {
  args: { status: 'cancelled' },
};

export const Failed: Story = {
  args: { status: 'failed' },
};

export const CustomLabel: Story = {
  args: { status: 'processing', label: 'crawling' },
};

export const AllStates: Story = {
  args: { status: 'queued' },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="queued" />
      <StatusBadge status="processing" label="crawling" />
      <StatusBadge status="complete" />
      <StatusBadge status="cancelled" />
      <StatusBadge status="failed" />
    </div>
  ),
};
