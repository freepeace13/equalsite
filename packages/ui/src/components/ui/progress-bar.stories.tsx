import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressBar } from './progress-bar';

const meta = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'select', options: ['sm', 'default'] },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 40, 'aria-label': 'Scan progress' },
};

export const Small: Story = {
  args: { value: 65, size: 'sm', 'aria-label': 'Scan progress' },
};

export const Empty: Story = {
  args: { value: 0, 'aria-label': 'Scan progress' },
};

export const Complete: Story = {
  args: { value: 100, 'aria-label': 'Scan progress' },
};
