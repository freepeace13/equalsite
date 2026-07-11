import type React from 'react';

import { cn } from '../../lib/utils';

export type ContainerProps = Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'className' | 'style'
> & {
    /** Deprecated: present for backward compatibility */
    className?: string;
    style?: React.CSSProperties;
    size?: 'sm' | 'md' | 'lg';
};

export function Container({
    className,
    style,
    size = 'lg',
    ...rest
}: ContainerProps) {
    const widths =
        size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-3xl' : 'max-w-6xl';

    return (
        <div
            className={cn(
                'mx-auto w-full px-4 sm:px-6',
                widths,
                'text-slate-900 dark:text-slate-100',
                className,
            )}
            style={style}
            {...rest}
        />
    );
}
