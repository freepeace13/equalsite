import type { Meta, StoryObj } from '@storybook/react-vite';

import { Container } from './container';

const meta = {
  title: 'Molecules/Container',
  component: Container,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

const swatch = (
  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
    Container content
  </div>
);

export const Small: Story = {
  args: { size: 'sm', children: swatch },
};

export const Medium: Story = {
  args: { size: 'md', children: swatch },
};

export const Large: Story = {
  args: { size: 'lg', children: swatch },
};
