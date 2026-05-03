import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, onChange, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'flex items-start gap-3 text-sm',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            'mt-0.5 h-4 w-4 rounded border border-input bg-background accent-primary',
            className
          )}
          checked={Boolean(checked)}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          {...props}
        />
        {label ? <span>{label}</span> : null}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
