import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

const meta = {
  title: 'Atoms/Table',
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { url: '/home', status: 200, issues: 4 },
  { url: '/about', status: 200, issues: 1 },
  { url: '/contact', status: 404, issues: 0 },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Pages scanned in this audit.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>URL</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Issues</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.url}>
            <TableCell>{row.url}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.issues}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
