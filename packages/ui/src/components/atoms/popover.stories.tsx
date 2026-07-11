import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from './popover';

const meta = {
  title: 'Atoms/Popover',
  component: Popover,
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Show error</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Fetch failed</PopoverTitle>
        <PopoverDescription>
          The crawler received a 404 response for this URL and skipped it.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};
