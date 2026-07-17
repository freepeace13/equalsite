import type { Meta, StoryObj } from '@storybook/react-vite';

import { SectionLabel } from './section-label';

const meta = {
  title: 'Molecules/SectionLabel',
  component: SectionLabel,
  tags: ['autodocs'],
} satisfies Meta<typeof SectionLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'score trend' },
};

export const WithAction: Story = {
  args: {
    children: 'your sites',
    action: (
      <a href="#" className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400">
        view all sites
      </a>
    ),
  },
};
