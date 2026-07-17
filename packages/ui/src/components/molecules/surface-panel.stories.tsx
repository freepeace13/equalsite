import type { Meta, StoryObj } from '@storybook/react-vite';

import { SurfacePanel } from './surface-panel';

const meta = {
  title: 'Molecules/SurfacePanel',
  component: SurfacePanel,
  tags: ['autodocs'],
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof SurfacePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: 'sm',
    children: <p className="text-sm">Monthly</p>,
    className: 'w-64',
  },
};

export const Sizes: Story = {
  args: { padding: 'sm', children: null },
  render: () => (
    <div className="flex flex-col gap-4">
      <SurfacePanel padding="sm" className="w-64">
        <p className="text-sm">padding=sm (p-4)</p>
      </SurfacePanel>
      <SurfacePanel padding="md" className="w-64">
        <p className="text-sm">padding=md (p-5)</p>
      </SurfacePanel>
      <SurfacePanel padding="lg" className="w-64 text-center">
        <p className="text-sm">padding=lg (p-10)</p>
      </SurfacePanel>
    </div>
  ),
};
