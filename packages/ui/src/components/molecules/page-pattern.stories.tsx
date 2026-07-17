import type { Meta, StoryObj } from '@storybook/react-vite';

import { PagePattern } from './page-pattern';

const meta = {
  title: 'Molecules/PagePattern',
  component: PagePattern,
  tags: ['autodocs'],
} satisfies Meta<typeof PagePattern>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'include-patterns',
    name: 'include',
    label: 'include only pages matching',
    placeholder: '/blog/*, /products/*',
    value: '',
    onValueChange: () => {},
  },
};

export const Filled: Story = {
  args: {
    id: 'exclude-patterns',
    name: 'exclude',
    label: 'exclude pages matching',
    placeholder: '/admin/*, /account/*',
    value: '/admin/*',
    onValueChange: () => {},
  },
};
