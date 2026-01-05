import { forwardRef } from 'preact/compat';
import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-preact';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onChange, label, className }, ref) => {
    return (
      <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
        <button
          ref={ref}
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            'h-4 w-4 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center',
            checked ? 'bg-primary text-primary-foreground' : 'bg-background'
          )}
        >
          {checked && <Check className="h-3 w-3" />}
        </button>
        {label && <span className="text-sm">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
