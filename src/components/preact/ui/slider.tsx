import { cn } from '@/lib/utils/cn';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
}

export function Slider({ value, onChange, min, max, step = 1, className }: SliderProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(e) => onChange(parseInt((e.target as HTMLInputElement).value))}
        className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-sm font-medium w-12 text-right">{value}</span>
    </div>
  );
}
