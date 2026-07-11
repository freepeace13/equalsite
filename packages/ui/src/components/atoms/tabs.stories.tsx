import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'Atoms/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="pages">Pages</TabsTrigger>
        <TabsTrigger value="issues">Issues</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Score, summary, and timeline.</TabsContent>
      <TabsContent value="pages">Every page the crawler reached.</TabsContent>
      <TabsContent value="issues">Every WCAG violation found.</TabsContent>
    </Tabs>
  ),
};

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="pages">Pages</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Score, summary, and timeline.</TabsContent>
      <TabsContent value="pages">Every page the crawler reached.</TabsContent>
    </Tabs>
  ),
};
