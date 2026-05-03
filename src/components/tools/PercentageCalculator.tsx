'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCopyToClipboard } from '@/hooks';

type Mode = 'percent-of' | 'what-percent' | 'percent-change';

const modeOptions = [
  { value: 'percent-of', label: 'X% of Y' },
  { value: 'what-percent', label: 'X is what % of Y' },
  { value: 'percent-change', label: '% change from X to Y' },
] as const;

const exampleValues: Record<Mode, { x: string; y: string }> = {
  'percent-of': { x: '20', y: '150' },
  'what-percent': { x: '30', y: '60' },
  'percent-change': { x: '100', y: '120' },
};

function parseNumber(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/,/g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>('percent-of');
  const [x, setX] = useState(exampleValues['percent-of'].x);
  const [y, setY] = useState(exampleValues['percent-of'].y);
  const copyResult = useCopyToClipboard();

  const result = useMemo(() => {
    const xValue = parseNumber(x);
    const yValue = parseNumber(y);

    if (xValue === null || yValue === null) {
      return {
        value: '',
        detail: 'Enter numbers in both fields to calculate.',
        error: '',
      };
    }

    if (mode === 'percent-of') {
      const calculated = (xValue / 100) * yValue;

      return {
        value: formatNumber(calculated),
        detail: `${formatNumber(xValue)}% of ${formatNumber(yValue)} = ${formatNumber(calculated)}`,
        error: '',
      };
    }

    if (mode === 'what-percent') {
      if (yValue === 0) {
        return {
          value: '',
          detail: '',
          error: 'Result is undefined because the second value cannot be zero in this mode.',
        };
      }

      const calculated = (xValue / yValue) * 100;

      return {
        value: `${formatNumber(calculated)}%`,
        detail: `${formatNumber(xValue)} is ${formatNumber(calculated)}% of ${formatNumber(yValue)}`,
        error: '',
      };
    }

    if (xValue === 0) {
      return {
        value: '',
        detail: '',
        error: 'Percentage change is undefined when the starting value is zero.',
      };
    }

    const calculated = ((yValue - xValue) / xValue) * 100;

    return {
      value: `${formatNumber(calculated)}%`,
      detail: `Change from ${formatNumber(xValue)} to ${formatNumber(yValue)} = ${formatNumber(calculated)}%`,
      error: '',
    };
  }, [mode, x, y]);

  const labels = useMemo(() => {
    switch (mode) {
      case 'percent-of':
        return {
          x: 'X',
          y: 'Y',
          xPlaceholder: '20',
          yPlaceholder: '150',
        };
      case 'what-percent':
        return {
          x: 'X',
          y: 'Y',
          xPlaceholder: '30',
          yPlaceholder: '60',
        };
      case 'percent-change':
        return {
          x: 'Old value',
          y: 'New value',
          xPlaceholder: '100',
          yPlaceholder: '120',
        };
    }
  }, [mode]);

  const handleModeChange = (value: Mode) => {
    setMode(value);
    setX(exampleValues[value].x);
    setY(exampleValues[value].y);
  };

  const handleClear = () => {
    setX('');
    setY('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Percentage Calculator</CardTitle>
          <CardDescription>
            Calculate percentages, increases and decreases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Mode</label>
            <Select value={mode} onValueChange={(value) => handleModeChange(value as Mode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {modeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">{labels.x}</label>
              <Input
                type="text"
                inputMode="decimal"
                value={x}
                onChange={(event) => setX((event.target as HTMLInputElement).value)}
                placeholder={labels.xPlaceholder}
                className="font-mono"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">{labels.y}</label>
              <Input
                type="text"
                inputMode="decimal"
                value={y}
                onChange={(event) => setY((event.target as HTMLInputElement).value)}
                placeholder={labels.yPlaceholder}
                className="font-mono"
              />
            </div>
          </div>

          {result.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {result.error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleClear} variant="outline">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              onClick={() => copyResult.copyToClipboard(result.value)}
              variant={copyResult.isCopied ? 'default' : 'outline'}
              disabled={!result.value}
            >
              {copyResult.isCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy result
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md bg-muted p-4 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
            {result.value || '-'}
          </div>
          <p className="text-sm text-muted-foreground">
            {result.error ? 'Adjust the input values to continue.' : result.detail}
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
