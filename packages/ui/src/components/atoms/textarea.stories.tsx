import type { Meta, StoryObj } from '@storybook/react-vite';

import { Textarea } from './textarea';

const meta = {
  title: 'Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Describe the issue...' },
};

export const Disabled: Story = {
  args: { placeholder: 'Disabled', disabled: true },
};
