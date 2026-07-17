import * as React from 'react';

import { cn } from '../../lib/utils';
import { Label } from '../atoms/label';
import { InputError } from './input-error';

export interface FormFieldProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  label: string;
  htmlFor: string;
  error?: string;
  /** Visually hide the label while keeping it available to screen readers. */
  hideLabel?: boolean;
  /** Rendered inline with the label, pushed to the right — e.g. a "Forgot password?" link. */
  labelAction?: React.ReactNode;
  children: React.ReactNode;
}

function FormField({
  label,
  htmlFor,
  error,
  hideLabel,
  labelAction,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div data-slot="form-field" className={cn('grid gap-2', className)} {...props}>
      <div className="flex items-center gap-2">
        <Label htmlFor={htmlFor} className={cn(hideLabel && 'sr-only')}>
          {label}
        </Label>
        {labelAction && <span className="ml-auto">{labelAction}</span>}
      </div>
      {children}
      <InputError message={error} />
    </div>
  );
}

export { FormField };
