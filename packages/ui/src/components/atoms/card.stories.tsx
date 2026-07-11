import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

const meta = {
  title: 'Atoms/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>example.com</CardTitle>
        <CardDescription>Last scanned 2 hours ago</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm">
            ⋯
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">12 issues found across 8 pages.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">View report</Button>
      </CardFooter>
    </Card>
  ),
};
