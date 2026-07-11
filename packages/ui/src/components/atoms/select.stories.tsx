import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="critical">
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Impact level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="critical">Critical</SelectItem>
        <SelectItem value="serious">Serious</SelectItem>
        <SelectItem value="moderate">Moderate</SelectItem>
        <SelectItem value="minor">Minor</SelectItem>
      </SelectContent>
    </Select>
  ),
};
