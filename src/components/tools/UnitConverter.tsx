'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, Check, Copy, Trash2 } from 'lucide-react';
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

type CategoryId =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'time'
  | 'data';

type UnitDefinition = {
  id: string;
  label: string;
  symbol: string;
  toBase?: number;
  fromBase?: number;
  toCanonical?: (value: number) => number;
  fromCanonical?: (value: number) => number;
};

type CategoryDefinition = {
  id: CategoryId;
  label: string;
  baseLabel: string;
  units: UnitDefinition[];
};

const UNIT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'length',
    label: 'Length',
    baseLabel: 'meter',
    units: [
      { id: 'millimeter', label: 'Millimeter', symbol: 'mm', toBase: 0.001 },
      { id: 'centimeter', label: 'Centimeter', symbol: 'cm', toBase: 0.01 },
      { id: 'meter', label: 'Meter', symbol: 'm', toBase: 1 },
      { id: 'kilometer', label: 'Kilometer', symbol: 'km', toBase: 1000 },
      { id: 'inch', label: 'Inch', symbol: 'in', toBase: 0.0254 },
      { id: 'foot', label: 'Foot', symbol: 'ft', toBase: 0.3048 },
      { id: 'yard', label: 'Yard', symbol: 'yd', toBase: 0.9144 },
      { id: 'mile', label: 'Mile', symbol: 'mi', toBase: 1609.344 },
    ],
  },
  {
    id: 'weight',
    label: 'Weight',
    baseLabel: 'kilogram',
    units: [
      { id: 'milligram', label: 'Milligram', symbol: 'mg', toBase: 0.000001 },
      { id: 'gram', label: 'Gram', symbol: 'g', toBase: 0.001 },
      { id: 'kilogram', label: 'Kilogram', symbol: 'kg', toBase: 1 },
      { id: 'metric-ton', label: 'Metric Ton', symbol: 't', toBase: 1000 },
      { id: 'ounce', label: 'Ounce', symbol: 'oz', toBase: 0.028349523125 },
      { id: 'pound', label: 'Pound', symbol: 'lb', toBase: 0.45359237 },
      { id: 'stone', label: 'Stone', symbol: 'st', toBase: 6.35029318 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    baseLabel: 'celsius',
    units: [
      {
        id: 'celsius',
        label: 'Celsius',
        symbol: '°C',
        toCanonical: (value) => value,
        fromCanonical: (value) => value,
      },
      {
        id: 'fahrenheit',
        label: 'Fahrenheit',
        symbol: '°F',
        toCanonical: (value) => ((value - 32) * 5) / 9,
        fromCanonical: (value) => (value * 9) / 5 + 32,
      },
      {
        id: 'kelvin',
        label: 'Kelvin',
        symbol: 'K',
        toCanonical: (value) => value - 273.15,
        fromCanonical: (value) => value + 273.15,
      },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    baseLabel: 'square meter',
    units: [
      { id: 'square-meter', label: 'Square Meter', symbol: 'm²', toBase: 1 },
      { id: 'square-kilometer', label: 'Square Kilometer', symbol: 'km²', toBase: 1_000_000 },
      { id: 'square-foot', label: 'Square Foot', symbol: 'ft²', toBase: 0.09290304 },
      { id: 'square-yard', label: 'Square Yard', symbol: 'yd²', toBase: 0.83612736 },
      { id: 'acre', label: 'Acre', symbol: 'ac', toBase: 4046.8564224 },
      { id: 'hectare', label: 'Hectare', symbol: 'ha', toBase: 10_000 },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    baseLabel: 'liter',
    units: [
      { id: 'milliliter', label: 'Milliliter', symbol: 'mL', toBase: 0.001 },
      { id: 'liter', label: 'Liter', symbol: 'L', toBase: 1 },
      { id: 'cubic-meter', label: 'Cubic Meter', symbol: 'm³', toBase: 1000 },
      { id: 'teaspoon', label: 'Teaspoon', symbol: 'tsp', toBase: 0.00492892159375 },
      { id: 'tablespoon', label: 'Tablespoon', symbol: 'tbsp', toBase: 0.01478676478125 },
      { id: 'cup', label: 'Cup', symbol: 'cup', toBase: 0.2365882365 },
      { id: 'pint', label: 'Pint', symbol: 'pt', toBase: 0.473176473 },
      { id: 'gallon', label: 'Gallon', symbol: 'gal', toBase: 3.785411784 },
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    baseLabel: 'meter per second',
    units: [
      { id: 'meter-per-second', label: 'Meter / Second', symbol: 'm/s', toBase: 1 },
      { id: 'kilometer-per-hour', label: 'Kilometer / Hour', symbol: 'km/h', toBase: 0.2777777777777778 },
      { id: 'mile-per-hour', label: 'Mile / Hour', symbol: 'mph', toBase: 0.44704 },
      { id: 'foot-per-second', label: 'Foot / Second', symbol: 'ft/s', toBase: 0.3048 },
      { id: 'knot', label: 'Knot', symbol: 'kn', toBase: 0.5144444444444445 },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    baseLabel: 'second',
    units: [
      { id: 'millisecond', label: 'Millisecond', symbol: 'ms', toBase: 0.001 },
      { id: 'second', label: 'Second', symbol: 's', toBase: 1 },
      { id: 'minute', label: 'Minute', symbol: 'min', toBase: 60 },
      { id: 'hour', label: 'Hour', symbol: 'h', toBase: 3600 },
      { id: 'day', label: 'Day', symbol: 'd', toBase: 86400 },
      { id: 'week', label: 'Week', symbol: 'wk', toBase: 604800 },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    baseLabel: 'byte',
    units: [
      { id: 'byte', label: 'Byte', symbol: 'B', toBase: 1 },
      { id: 'kilobyte', label: 'Kilobyte', symbol: 'KB', toBase: 1000 },
      { id: 'megabyte', label: 'Megabyte', symbol: 'MB', toBase: 1000 * 1000 },
      { id: 'gigabyte', label: 'Gigabyte', symbol: 'GB', toBase: 1000 * 1000 * 1000 },
      { id: 'terabyte', label: 'Terabyte', symbol: 'TB', toBase: 1000 * 1000 * 1000 * 1000 },
      { id: 'kibibyte', label: 'Kibibyte', symbol: 'KiB', toBase: 1024 },
      { id: 'mebibyte', label: 'Mebibyte', symbol: 'MiB', toBase: 1024 * 1024 },
      { id: 'gibibyte', label: 'Gibibyte', symbol: 'GiB', toBase: 1024 * 1024 * 1024 },
    ],
  },
];

const categoryOptions = UNIT_CATEGORIES.map((category) => ({
  value: category.id,
  label: category.label,
}));

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
  if (!Number.isFinite(value)) {
    return '';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8,
  }).format(value);
}

function convertValue(value: number, fromUnit: UnitDefinition, toUnit: UnitDefinition): number {
  if (fromUnit.toCanonical && fromUnit.fromCanonical && toUnit.toCanonical && toUnit.fromCanonical) {
    return toUnit.fromCanonical(fromUnit.toCanonical(value));
  }

  const baseValue = value * (fromUnit.toBase ?? 1);
  return baseValue / (toUnit.toBase ?? 1);
}

export function UnitConverter() {
  const [categoryId, setCategoryId] = useState<CategoryId>('length');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnitId, setFromUnitId] = useState('meter');
  const [toUnitId, setToUnitId] = useState('foot');
  const copyResult = useCopyToClipboard();

  const category = useMemo(
    () => UNIT_CATEGORIES.find((item) => item.id === categoryId) ?? UNIT_CATEGORIES[0],
    [categoryId]
  );

  const unitOptions = useMemo(
    () =>
      category.units.map((unit) => ({
        value: unit.id,
        label: `${unit.label} (${unit.symbol})`,
      })),
    [category]
  );

  useEffect(() => {
    const [firstUnit, secondUnit] = category.units;
    setFromUnitId(firstUnit.id);
    setToUnitId((secondUnit ?? firstUnit).id);
  }, [category]);

  const result = useMemo(() => {
    const numericValue = parseNumber(inputValue);
    const fromUnit = category.units.find((unit) => unit.id === fromUnitId);
    const toUnit = category.units.find((unit) => unit.id === toUnitId);

    if (numericValue === null || !fromUnit || !toUnit) {
      return {
        value: '',
        detail: 'Enter a number and choose units to convert.',
      };
    }

    const converted = convertValue(numericValue, fromUnit, toUnit);

    return {
      value: `${formatNumber(converted)} ${toUnit.symbol}`,
      detail: `${formatNumber(numericValue)} ${fromUnit.symbol} = ${formatNumber(converted)} ${toUnit.symbol}`,
    };
  }, [category.units, fromUnitId, inputValue, toUnitId]);

  const handleSwap = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  const handleClear = () => {
    setInputValue('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unit Converter</CardTitle>
          <CardDescription>
            Convert between common units for length, weight, temperature, area, volume, speed, time, and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <Select value={categoryId} onValueChange={(value) => setCategoryId(value as CategoryId)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Value</label>
            <Input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(event) => setInputValue((event.target as HTMLInputElement).value)}
              placeholder="Enter value..."
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium">From</label>
              <Select value={fromUnitId} onValueChange={setFromUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleSwap} variant="outline" size="icon" aria-label="Swap units">
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">To</label>
              <Select value={toUnitId} onValueChange={setToUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

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
          <CardDescription>
            Base unit for {category.label.toLowerCase()}: {category.baseLabel}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md bg-muted p-4 font-mono text-3xl font-semibold tracking-tight">
            {result.value || '-'}
          </div>
          <p className="text-sm text-muted-foreground">{result.detail}</p>
        </CardContent>
      </Card>

    </div>
  );
}
