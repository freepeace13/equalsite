import type { Meta, StoryObj } from '@storybook/react-vite';

import { EnqueueStrategy } from './enqueue-strategy';

const meta = {
  title: 'Molecules/EnqueueStrategy',
  component: EnqueueStrategy,
  tags: ['autodocs'],
} satisfies Meta<typeof EnqueueStrategy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {
  args: { value: true, onValueChange: () => {} },
};

export const Off: Story = {
  args: { value: false, onValueChange: () => {} },
};
