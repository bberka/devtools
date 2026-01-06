import { forwardRef } from 'preact/compat';
import type { ComponentChildren } from 'preact';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends Omit<preact.JSX.HTMLAttributes<HTMLSelectElement>, 'ref'> {
  options?: { value: string; label: string }[];
  children?: ComponentChildren;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
    );
  }
);

Select.displayName = 'Select';
