import type { Meta, StoryObj } from '@storybook/react-vite';

import { Callout } from './callout';

const meta = {
  title: 'UI/Callout',
  component: Callout,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['neutral', 'danger', 'success', 'warning'] },
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children:
      '2 audits run at a time so every scan gets a full, accurate crawl. no need to keep this tab open — bookmark the link to check back later.',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Scan failed.',
    children: "Couldn't reach the site.",
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Great news — this site passed all WCAG 2.2 AA checks.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Heads up —',
    children: 'this scan is taking longer than usual.',
  },
};

export const CancelledBanner: Story = {
  args: {
    variant: 'neutral',
    title: 'Audit cancelled.',
    children: 'No report will be generated for this run.',
  },
};
