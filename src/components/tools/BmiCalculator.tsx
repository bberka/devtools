'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Scale, Trash2 } from 'lucide-react';
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

type UnitSystem = 'metric' | 'us';

const unitOptions = [
  { value: 'metric', label: 'Metric (kg, cm)' },
  { value: 'us', label: 'US Customary (lb, ft, in)' },
] as const;

function parseNumber(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/,/g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value);
}

function getBmiCategory(bmi: number): {
  label: string;
  detail: string;
  accent: string;
} {
  if (bmi < 18.5) {
    return {
      label: 'Underweight',
      detail: 'Below 18.5',
      accent: 'text-sky-600',
    };
  }

  if (bmi < 25) {
    return {
      label: 'Healthy Weight',
      detail: '18.5 to less than 25',
      accent: 'text-emerald-600',
    };
  }

  if (bmi < 30) {
    return {
      label: 'Overweight',
      detail: '25 to less than 30',
      accent: 'text-amber-600',
    };
  }

  if (bmi < 35) {
    return {
      label: 'Class 1 Obesity',
      detail: '30 to less than 35',
      accent: 'text-orange-600',
    };
  }

  if (bmi < 40) {
    return {
      label: 'Class 2 Obesity',
      detail: '35 to less than 40',
      accent: 'text-red-600',
    };
  }

  return {
    label: 'Class 3 Obesity',
    detail: '40 or greater',
    accent: 'text-rose-700',
  };
}

export function BmiCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [weightMetric, setWeightMetric] = useState('72');
  const [heightCm, setHeightCm] = useState('175');
  const [weightUs, setWeightUs] = useState('159');
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('9');
  const copyResult = useCopyToClipboard();

  const result = useMemo(() => {
    let weightKg: number | null = null;
    let heightMeters: number | null = null;

    if (unitSystem === 'metric') {
      const parsedWeight = parseNumber(weightMetric);
      const parsedHeightCm = parseNumber(heightCm);

      if (parsedWeight === null || parsedHeightCm === null) {
        return {
          bmi: '',
          category: null as ReturnType<typeof getBmiCategory> | null,
          error: '',
          detail: 'Enter weight and height to calculate BMI.',
        };
      }

      if (parsedWeight <= 0 || parsedHeightCm <= 0) {
        return {
          bmi: '',
          category: null as ReturnType<typeof getBmiCategory> | null,
          error: 'Weight and height must be greater than zero.',
          detail: '',
        };
      }

      weightKg = parsedWeight;
      heightMeters = parsedHeightCm / 100;
    } else {
      const parsedWeightUs = parseNumber(weightUs);
      const parsedFeet = parseNumber(heightFeet);
      const parsedInches = parseNumber(heightInches);

      if (parsedWeightUs === null || parsedFeet === null || parsedInches === null) {
        return {
          bmi: '',
          category: null as ReturnType<typeof getBmiCategory> | null,
          error: '',
          detail: 'Enter weight, feet, and inches to calculate BMI.',
        };
      }

      if (parsedWeightUs <= 0 || parsedFeet < 0 || parsedInches < 0) {
        return {
          bmi: '',
          category: null as ReturnType<typeof getBmiCategory> | null,
          error: 'Weight and height values must be valid positive numbers.',
          detail: '',
        };
      }

      const totalInches = parsedFeet * 12 + parsedInches;

      if (totalInches <= 0) {
        return {
          bmi: '',
          category: null as ReturnType<typeof getBmiCategory> | null,
          error: 'Height must be greater than zero.',
          detail: '',
        };
      }

      weightKg = parsedWeightUs * 0.45359237;
      heightMeters = totalInches * 0.0254;
    }

    const bmiValue = weightKg / (heightMeters * heightMeters);
    const category = getBmiCategory(bmiValue);

    return {
      bmi: formatNumber(bmiValue, 1),
      category,
      error: '',
      detail: `BMI = weight (kg) / height (m)^2`,
    };
  }, [heightCm, heightFeet, heightInches, unitSystem, weightMetric, weightUs]);

  const handleUnitChange = (value: UnitSystem) => {
    setUnitSystem(value);
  };

  const handleClear = () => {
    setWeightMetric('');
    setHeightCm('');
    setWeightUs('');
    setHeightFeet('');
    setHeightInches('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>BMI Calculator</CardTitle>
          <CardDescription>
            Calculate adult BMI and screening category using metric or US customary units.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Units</label>
            <Select value={unitSystem} onValueChange={(value) => handleUnitChange(value as UnitSystem)}>
              <SelectTrigger>
                <SelectValue placeholder="Select units" />
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

          {unitSystem === 'metric' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="metric-weight" className="mb-2 block text-sm font-medium">
                  Weight (kg)
                </label>
                <Input
                  id="metric-weight"
                  type="text"
                  inputMode="decimal"
                  value={weightMetric}
                  onChange={(event) => setWeightMetric((event.target as HTMLInputElement).value)}
                  placeholder="72"
                  className="font-mono"
                />
              </div>
              <div>
                <label htmlFor="metric-height" className="mb-2 block text-sm font-medium">
                  Height (cm)
                </label>
                <Input
                  id="metric-height"
                  type="text"
                  inputMode="decimal"
                  value={heightCm}
                  onChange={(event) => setHeightCm((event.target as HTMLInputElement).value)}
                  placeholder="175"
                  className="font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="us-weight" className="mb-2 block text-sm font-medium">
                  Weight (lb)
                </label>
                <Input
                  id="us-weight"
                  type="text"
                  inputMode="decimal"
                  value={weightUs}
                  onChange={(event) => setWeightUs((event.target as HTMLInputElement).value)}
                  placeholder="159"
                  className="font-mono"
                />
              </div>
              <div>
                <label htmlFor="us-height-feet" className="mb-2 block text-sm font-medium">
                  Height (ft)
                </label>
                <Input
                  id="us-height-feet"
                  type="text"
                  inputMode="numeric"
                  value={heightFeet}
                  onChange={(event) => setHeightFeet((event.target as HTMLInputElement).value)}
                  placeholder="5"
                  className="font-mono"
                />
              </div>
              <div>
                <label htmlFor="us-height-inches" className="mb-2 block text-sm font-medium">
                  Height (in)
                </label>
                <Input
                  id="us-height-inches"
                  type="text"
                  inputMode="decimal"
                  value={heightInches}
                  onChange={(event) => setHeightInches((event.target as HTMLInputElement).value)}
                  placeholder="9"
                  className="font-mono"
                />
              </div>
            </div>
          )}

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
              onClick={() => copyResult.copyToClipboard(result.bmi)}
              variant={copyResult.isCopied ? 'default' : 'outline'}
              disabled={!result.bmi}
            >
              {copyResult.isCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy BMI
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
            {result.error ? 'Adjust the input values to continue.' : result.detail}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
            {result.bmi ? `${result.bmi} kg/m²` : '-'}
          </div>

          {result.category && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border bg-card p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Scale className="h-3.5 w-3.5" />
                  Category
                </div>
                <div className={`mt-1 text-lg font-semibold ${result.category.accent}`}>
                  {result.category.label}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Range: {result.category.detail}
                </div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Screening note
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  BMI is a screening measure for adults 20 and older and should be considered with other health factors.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Adult BMI categories in this tool follow CDC thresholds: underweight below 18.5, healthy weight 18.5 to less than 25, overweight 25 to less than 30, and obesity 30 or greater.
        </CardContent>
      </Card>
    </div>
  );
}
