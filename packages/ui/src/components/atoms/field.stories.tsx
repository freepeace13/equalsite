import type { Meta, StoryObj } from '@storybook/react-vite';

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from './field';
import { Input } from './input';

const meta = {
  title: 'Atoms/Field',
  component: Field,
  tags: ['autodocs'],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FieldGroup className="w-80">
      <Field>
        <FieldLabel htmlFor="url">Website URL</FieldLabel>
        <Input id="url" placeholder="https://example.com" />
        <FieldDescription>We'll crawl every page we can reach from here.</FieldDescription>
      </Field>
    </FieldGroup>
  ),
};

export const WithError: Story = {
  render: () => (
    <FieldGroup className="w-80">
      <Field data-invalid="true">
        <FieldLabel htmlFor="url-invalid">Website URL</FieldLabel>
        <Input id="url-invalid" aria-invalid defaultValue="not-a-url" />
        <FieldError>Enter a valid URL starting with http:// or https://.</FieldError>
      </Field>
    </FieldGroup>
  ),
};
