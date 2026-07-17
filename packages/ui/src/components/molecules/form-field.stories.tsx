import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from '../atoms/input';
import { FormField } from './form-field';

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email address',
    htmlFor: 'email',
    children: <Input id="email" type="email" placeholder="email@example.com" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email address',
    htmlFor: 'email-error',
    error: 'The email field is required.',
    children: <Input id="email-error" type="email" placeholder="email@example.com" />,
  },
};

export const WithLabelAction: Story = {
  args: {
    label: 'Password',
    htmlFor: 'password',
    children: <Input id="password" type="password" placeholder="Password" />,
    labelAction: (
      <a href="#" className="text-sm text-indigo-700 hover:underline dark:text-indigo-400">
        Forgot password?
      </a>
    ),
  },
};

export const HiddenLabel: Story = {
  args: {
    label: 'Password',
    htmlFor: 'password-hidden',
    hideLabel: true,
    children: <Input id="password-hidden" type="password" placeholder="Password" />,
  },
};
