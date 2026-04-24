'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onChange, onCheckedChange, label, className }, ref) => (
    <label className={cn('flex cursor-pointer items-center gap-2', className)}>
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => {
          const nextChecked = !checked;
          onChange?.(nextChecked);
          onCheckedChange?.(nextChecked);
        }}
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          checked ? 'bg-primary text-primary-foreground' : 'bg-background'
        )}
      >
        {checked && <Check className="h-3 w-3" />}
      </button>
      {label ? <span className="text-sm">{label}</span> : null}
    </label>
  )
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
