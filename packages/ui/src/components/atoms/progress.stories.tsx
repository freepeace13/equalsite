import type { Meta, StoryObj } from '@storybook/react-vite';

import { Progress } from './progress';

const meta = {
  title: 'Atoms/Progress',
  component: Progress,
  tags: ['autodocs'],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 45 },
  render: (args) => (
    <div className="w-72">
      <Progress {...args} />
    </div>
  ),
};

export const Complete: Story = {
  args: { value: 100 },
  render: (args) => (
    <div className="w-72">
      <Progress {...args} />
    </div>
  ),
};
