import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from './alert';

const meta = {
  title: 'Atoms/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive'] },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <CheckCircle2Icon />
      <AlertTitle>Audit complete.</AlertTitle>
      <AlertDescription>Your report is ready to view.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Alert {...args}>
      <AlertCircleIcon />
      <AlertTitle>Something went wrong.</AlertTitle>
      <AlertDescription>The URL you entered could not be reached.</AlertDescription>
    </Alert>
  ),
};
