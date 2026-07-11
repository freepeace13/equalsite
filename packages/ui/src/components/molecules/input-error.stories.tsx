import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { InputError } from './input-error';

const meta = {
  title: 'Molecules/InputError',
  component: InputError,
  tags: ['autodocs'],
} satisfies Meta<typeof InputError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'The email field is required.',
  },
};

export const NoMessage: Story = {
  args: {
    message: undefined,
  },
};

export const WithField: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" aria-invalid />
      <InputError message="The email field is required." />
    </div>
  ),
};
