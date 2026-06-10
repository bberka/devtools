'use client';

import { useMemo, useState } from 'react';
import { CalendarRange, Check, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { useCopyToClipboard } from '@/hooks';

type DifferenceBreakdown = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getTodayValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, monthIndex, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatLongDate(value: string): string {
  const date = parseDateInput(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}


function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function calculateDifference(
  startDateValue: string,
  endDateValue: string
): DifferenceBreakdown | null {
  const startDate = parseDateInput(startDateValue);
  const endDate = parseDateInput(endDateValue);

  if (!startDate || !endDate || endDate < startDate) {
    return null;
  }

  let years = endDate.getUTCFullYear() - startDate.getUTCFullYear();
  let months = endDate.getUTCMonth() - startDate.getUTCMonth();
  let days = endDate.getUTCDate() - startDate.getUTCDate();

  if (days < 0) {
    months -= 1;
    const previousMonthIndex = (endDate.getUTCMonth() + 11) % 12;
    const previousMonthYear =
      previousMonthIndex === 11 ? endDate.getUTCFullYear() - 1 : endDate.getUTCFullYear();
    days += getDaysInMonth(previousMonthYear, previousMonthIndex);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / DAY_IN_MS);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
  };
}

export function DateDifferenceCalculator() {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(getTodayValue());
  const copyResult = useCopyToClipboard();

  const result = useMemo(() => {
    if (!startDate || !endDate) {
      return {
        value: '',
        detail: 'Choose both dates to calculate the difference.',
        error: '',
        breakdown: null as DifferenceBreakdown | null,
      };
    }

    const parsedStartDate = parseDateInput(startDate);
    const parsedEndDate = parseDateInput(endDate);

    if (!parsedStartDate || !parsedEndDate) {
      return {
        value: '',
        detail: '',
        error: 'Enter valid calendar dates.',
        breakdown: null as DifferenceBreakdown | null,
      };
    }

    if (parsedEndDate < parsedStartDate) {
      return {
        value: '',
        detail: '',
        error: 'The end date cannot be earlier than the start date.',
        breakdown: null as DifferenceBreakdown | null,
      };
    }

    const breakdown = calculateDifference(startDate, endDate);

    if (!breakdown) {
      return {
        value: '',
        detail: '',
        error: 'Unable to calculate the difference for the selected dates.',
        breakdown: null as DifferenceBreakdown | null,
      };
    }

    return {
      value: `${breakdown.years} years, ${breakdown.months} months, ${breakdown.days} days`,
      detail: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      error: '',
      breakdown,
    };
  }, [endDate, startDate]);

  const handleClear = () => {
    setStartDate('');
    setEndDate(getTodayValue());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Date Difference Calculator</CardTitle>
          <CardDescription>
            Compare two dates and see the exact calendar difference plus total days, weeks, and months.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Start date</label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                disabled={(date) => {
                  if (!endDate) return false;
                  const [y, m, d] = endDate.split('-').map(Number);
                  return date > new Date(y, m - 1, d);
                }}
                error={!parseDateInput(startDate) && !!startDate}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">End date</label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                disabled={(date) => {
                  if (!startDate) return false;
                  const [y, m, d] = startDate.split('-').map(Number);
                  return date < new Date(y, m - 1, d);
                }}
                error={!parseDateInput(endDate) && !!endDate}
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
          <CardDescription>
            {result.error ? 'Adjust the selected dates to continue.' : result.detail}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
            {result.value || '-'}
          </div>

          {result.breakdown && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total months
                </div>
                <div className="mt-1 font-mono text-lg font-semibold">
                  {formatNumber(result.breakdown.totalMonths)}
                </div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total weeks
                </div>
                <div className="mt-1 font-mono text-lg font-semibold">
                  {formatNumber(result.breakdown.totalWeeks)}
                </div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total days
                </div>
                <div className="mt-1 font-mono text-lg font-semibold">
                  {formatNumber(result.breakdown.totalDays)}
                </div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Notes
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Calendar difference uses exact year/month/day boundaries rather than just dividing by 30 or 365.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
