import { forwardRef } from 'preact/compat';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends JSX.HTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 6, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        rows={rows}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
