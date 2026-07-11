import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from './heading';

const meta = {
  title: 'Molecules/Heading',
  component: Heading,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'small'] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Audit history',
    description: 'Every scan you have run, most recent first.',
  },
};

export const Small: Story = {
  args: {
    title: 'Danger zone',
    description: 'These actions cannot be undone.',
    variant: 'small',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Notifications',
  },
};
