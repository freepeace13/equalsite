import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScoreRing } from './score-ring';

const meta = {
  title: 'Molecules/ScoreRing',
  component: ScoreRing,
  tags: ['autodocs'],
  argTypes: {
    score: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: { type: 'number' } },
  },
} satisfies Meta<typeof ScoreRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { score: 94 },
};

export const Small: Story = {
  args: { score: 94, size: 40 },
};

export const Large: Story = {
  args: { score: 76, size: 76, strokeWidth: 7 },
};

export const AllScores: Story = {
  args: { score: 94 },
  render: () => (
    <div className="flex items-center gap-4">
      <ScoreRing score={96} size={56} />
      <ScoreRing score={74} size={56} />
      <ScoreRing score={38} size={56} />
    </div>
  ),
};
