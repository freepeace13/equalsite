import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import { CheckIcon } from './icons/icons';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'ghost-destructive',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

export const GhostDestructive: Story = {
  args: {
    variant: 'ghost-destructive',
    children: 'Cancel audit',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const IconSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon-xs" variant="outline" aria-label="Extra small icon button">
        <CheckIcon />
      </Button>
      <Button size="icon-sm" variant="outline" aria-label="Small icon button">
        <CheckIcon />
      </Button>
      <Button size="icon" variant="outline" aria-label="Default icon button">
        <CheckIcon />
      </Button>
      <Button size="icon-lg" variant="outline" aria-label="Large icon button">
        <CheckIcon />
      </Button>
    </div>
  ),
};
