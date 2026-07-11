import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'Atoms/Label',
  component: Label,
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Email' },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="email-label-story">Email</Label>
      <Input id="email-label-story" type="email" placeholder="you@example.com" />
    </div>
  ),
};
