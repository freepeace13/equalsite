import type { Meta, StoryObj } from '@storybook/react-vite';
import { BoldIcon } from 'lucide-react';

import { Toggle } from './toggle';

const meta = {
  title: 'Atoms/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline'] },
    size: { control: 'select', options: ['default', 'sm', 'lg'] },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <BoldIcon />
    </Toggle>
  ),
};

export const Outline: Story = {
  args: { variant: 'outline' },
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <BoldIcon />
    </Toggle>
  ),
};

export const Pressed: Story = {
  args: { defaultPressed: true },
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <BoldIcon />
    </Toggle>
  ),
};
