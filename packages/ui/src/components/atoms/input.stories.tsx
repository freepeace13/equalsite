import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './input';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'https://example.com' },
};

export const Invalid: Story = {
  args: { defaultValue: 'not-a-url', 'aria-invalid': true },
};

export const Disabled: Story = {
  args: { placeholder: 'Disabled', disabled: true },
};
