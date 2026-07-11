import type React from 'react';

import { cn } from '../../lib/utils';

export type StackProps = Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'className' | 'style'
> & {
    /** Deprecated: present for backward compatibility */
    className?: string;
    style?: React.CSSProperties;
    direction?: 'row' | 'col';
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between';
    wrap?: boolean;
};

const gapMap: Record<NonNullable<StackProps['gap']>, string> = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};

const alignMap: Record<NonNullable<StackProps['align']>, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
};

const justifyMap: Record<NonNullable<StackProps['justify']>, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
};

export function Stack({
    className,
    style,
    direction = 'col',
    gap = 'md',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    ...rest
}: StackProps) {
    return (
        <div
            className={cn(
                'flex',
                direction === 'row' ? 'flex-row' : 'flex-col',
                gapMap[gap],
                alignMap[align],
                justifyMap[justify],
                wrap ? 'flex-wrap' : 'flex-nowrap',
                className,
            )}
            style={style}
            {...rest}
        />
    );
}
