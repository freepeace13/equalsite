import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stack } from './stack';

const meta = {
  title: 'Molecules/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['row', 'col'] },
    gap: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const chip = (label: string) => (
  <div
    key={label}
    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
  >
    {label}
  </div>
);

export const Column: Story = {
  args: {
    direction: 'col',
    gap: 'md',
    children: [chip('One'), chip('Two'), chip('Three')],
  },
};

export const Row: Story = {
  args: {
    direction: 'row',
    gap: 'sm',
    children: [chip('One'), chip('Two'), chip('Three')],
  },
};
