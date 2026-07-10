import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatPair } from './stat-pair';

const meta = {
  title: 'UI/StatPair',
  component: StatPair,
  tags: ['autodocs'],
} satisfies Meta<typeof StatPair>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QueuePosition: Story = {
  args: {
    items: [
      { value: 4, label: 'position in queue' },
      { value: '~6', label: 'min estimated wait' },
    ],
  },
};
