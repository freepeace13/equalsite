import type { Meta, StoryObj } from '@storybook/react-vite';

import { PasswordInput } from './password-input';

const meta = {
  title: 'Molecules/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your password',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'super-secret-password',
  },
};
