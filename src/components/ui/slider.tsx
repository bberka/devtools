'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number;
  onChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onChange, min = 0, max = 100, step = 1, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      className={cn('h-2 w-full cursor-pointer accent-primary', className)}
      onChange={(event) => onChange?.(Number(event.target.value))}
      {...props}
    />
  )
);

Slider.displayName = 'Slider';

export { Slider };
