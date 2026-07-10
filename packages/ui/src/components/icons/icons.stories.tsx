import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icons from './icons';
import { LockIcon } from './icons';

const meta = {
  title: 'UI/Icons',
  component: LockIcon,
  tags: ['autodocs'],
} satisfies Meta<typeof LockIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

const ICON_NAMES = Object.keys(Icons) as (keyof typeof Icons)[];

export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6 p-2 text-slate-700 sm:grid-cols-6 dark:text-slate-200">
      {ICON_NAMES.map((name) => {
        const Icon = Icons[name] as React.ComponentType<Icons.IconProps>;
        return (
          <div
            key={name}
            className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800"
          >
            <Icon width={22} height={22} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {name}
            </span>
          </div>
        );
      })}
    </div>
  ),
};
