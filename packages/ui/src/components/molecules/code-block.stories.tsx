import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from './code-block';

const meta = {
  title: 'Molecules/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    code: `<img src="hero.png">`,
    label: 'HTML',
  },
};

export const LongSnippet: Story = {
  args: {
    code: [
      '<button type="button" onclick="submitForm()">',
      '  Submit',
      '</button>',
      '',
      '<!-- Missing an accessible name for screen readers -->',
    ].join('\n'),
    label: 'Suggested fix',
    maxHeightClassName: 'max-h-40',
  },
};
