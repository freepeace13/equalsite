import type { Meta, StoryObj } from '@storybook/react-vite';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../atoms/table';
import { TableCard } from './table-card';

const meta = {
  title: 'Molecules/TableCard',
  component: TableCard,
  tags: ['autodocs'],
} satisfies Meta<typeof TableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <TableCard className="w-[480px]">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900">
            <TableHead>domain</TableHead>
            <TableHead>status</TableHead>
            <TableHead>score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">example.com</TableCell>
            <TableCell>complete</TableCell>
            <TableCell>94</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableCard>
  ),
};
