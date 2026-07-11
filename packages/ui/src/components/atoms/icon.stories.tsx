import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from 'lucide-react';

import { Icon } from './icon';

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    iconNode: Search,
    className: 'size-5 text-muted-foreground',
  },
};

export const Empty: Story = {
  args: {
    iconNode: null,
  },
};
