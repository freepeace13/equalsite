import type { Meta, StoryObj } from '@storybook/react-vite';

import { AlertError } from './alert-error';

const meta = {
  title: 'Molecules/AlertError',
  component: AlertError,
  tags: ['autodocs'],
} satisfies Meta<typeof AlertError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleError: Story = {
  args: {
    errors: ['The URL you entered could not be reached.'],
  },
};

export const MultipleErrors: Story = {
  args: {
    title: 'Fix the following before submitting:',
    errors: [
      'The URL must start with http:// or https://.',
      'The email field is required.',
      'The password must be at least 8 characters.',
    ],
  },
};
