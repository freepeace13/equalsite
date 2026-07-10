import type { Meta, StoryObj } from '@storybook/react-vite';

import { SeverityBadge } from './severity-badge';

const meta = {
  title: 'UI/SeverityBadge',
  component: SeverityBadge,
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['critical', 'serious', 'moderate', 'minor', 'pass'],
    },
  },
} satisfies Meta<typeof SeverityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Critical: Story = {
  args: { severity: 'critical' },
};

export const Serious: Story = {
  args: { severity: 'serious' },
};

export const Moderate: Story = {
  args: { severity: 'moderate' },
};

export const Minor: Story = {
  args: { severity: 'minor' },
};

export const Pass: Story = {
  args: { severity: 'pass', label: 'passed' },
};

export const AllSeverities: Story = {
  args: { severity: 'critical' },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <SeverityBadge severity="critical" />
      <SeverityBadge severity="serious" />
      <SeverityBadge severity="moderate" />
      <SeverityBadge severity="minor" />
      <SeverityBadge severity="pass" label="passed" />
    </div>
  ),
};
