import type { Meta, StoryObj } from '@storybook/react-vite';

import { CrawlDepth } from './crawl-depth';

const CRAWL_DEPTHS = [
  { label: 'shallow', value: '1' },
  { label: 'standard', value: '3' },
  { label: 'deep', value: '5' },
];

const meta = {
  title: 'Molecules/CrawlDepth',
  component: CrawlDepth,
  tags: ['autodocs'],
} satisfies Meta<typeof CrawlDepth>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { options: CRAWL_DEPTHS, value: '3', onValueChange: () => {} },
};

export const Shallow: Story = {
  args: { options: CRAWL_DEPTHS, value: '1', onValueChange: () => {} },
};

export const Deep: Story = {
  args: { options: CRAWL_DEPTHS, value: '5', onValueChange: () => {} },
};
