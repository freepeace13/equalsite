import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface InputErrorProps extends HTMLAttributes<HTMLParagraphElement> {
    message?: string;
}

export function InputError({ message, className = '', ...props }: InputErrorProps) {
    return message ? (
        <p
            {...props}
            className={cn('text-sm text-red-600 dark:text-red-400', className)}
        >
            {message}
        </p>
    ) : null;
}
