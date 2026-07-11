import type { Meta, StoryObj } from '@storybook/react-vite';
import { toast } from 'sonner';

import { Button } from './button';
import { Toaster } from './sonner';

const meta = {
  title: 'Atoms/Toaster',
  component: Toaster,
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div>
      <Button onClick={() => toast('Audit queued for scanning.')}>Show toast</Button>
      <Toaster {...args} />
    </div>
  ),
};

export const DarkTheme: Story = {
  args: {
    theme: 'dark',
  },
  render: (args) => (
    <div>
      <Button onClick={() => toast.error('Audit failed to complete.')}>Show error toast</Button>
      <Toaster {...args} />
    </div>
  ),
};
