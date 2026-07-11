import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group';

const meta = {
  title: 'Atoms/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Previous</Button>
      <Button variant="outline">Next</Button>
    </ButtonGroup>
  ),
};

export const WithSeparatorAndText: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Copy</Button>
      <ButtonGroupSeparator />
      <ButtonGroupText>10 rows</ButtonGroupText>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
};
