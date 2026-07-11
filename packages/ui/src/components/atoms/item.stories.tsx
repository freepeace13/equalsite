import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlobeIcon } from 'lucide-react';

import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from './item';
import { Button } from './button';

const meta = {
  title: 'Atoms/Item',
  component: Item,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline', 'muted'] },
    size: { control: 'select', options: ['default', 'sm', 'xs'] },
  },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'outline' },
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemMedia variant="icon">
        <GlobeIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>example.com</ItemTitle>
        <ItemDescription>Started 2 minutes ago</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          Cancel
        </Button>
      </ItemActions>
    </Item>
  ),
};

export const Muted: Story = {
  args: { variant: 'muted' },
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemContent>
        <ItemTitle>Queued</ItemTitle>
        <ItemDescription>Waiting for a worker to pick this up.</ItemDescription>
      </ItemContent>
    </Item>
  ),
};
