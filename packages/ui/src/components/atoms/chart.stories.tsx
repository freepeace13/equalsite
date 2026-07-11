import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { type ChartConfig, ChartContainer } from './chart';

const meta = {
  title: 'Atoms/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const chartConfig = {
  critical: { label: 'Critical', color: 'var(--chart-1)' },
  serious: { label: 'Serious', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const data = [
  { page: '/home', critical: 4, serious: 8 },
  { page: '/about', critical: 1, serious: 3 },
  { page: '/contact', critical: 2, serious: 5 },
];

export const Default: Story = {
  args: {
    config: chartConfig,
    className: 'h-64 w-full',
    children: (
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="page" tickLine={false} axisLine={false} />
        <Bar dataKey="critical" fill="var(--color-critical)" radius={4} />
        <Bar dataKey="serious" fill="var(--color-serious)" radius={4} />
      </BarChart>
    ),
  },
};
