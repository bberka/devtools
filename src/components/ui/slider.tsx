'use client';

import { cn } from '@/lib/utils/cn';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  className,
}: SliderProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.currentTarget.value, 10))}
        className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
      />
      <span className="w-12 text-right text-sm font-medium">{value}</span>
    </div>
  );
}
