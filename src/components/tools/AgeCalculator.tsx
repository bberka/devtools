'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Check, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCopyToClipboard } from '@/hooks';

type AgeBreakdown = {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  nextBirthdayAge: number;
  nextBirthdayLabel: string;
  nextBirthdayDaysAway: number;
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

function clampBirthdayDay(year: number, monthIndex: number, day: number): number {
  return Math.min(day, getDaysInMonth(year, monthIndex));
}

function calculateAge(birthDateValue: string, targetDateValue: string): AgeBreakdown | null {
  const birthDate = parseDateInput(birthDateValue);
  const targetDate = parseDateInput(targetDateValue);

  if (!birthDate || !targetDate || targetDate < birthDate) {
    return null;
  }

  let years = targetDate.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = targetDate.getUTCMonth() - birthDate.getUTCMonth();
  let days = targetDate.getUTCDate() - birthDate.getUTCDate();

  if (days < 0) {
    months -= 1;
    const previousMonthIndex = (targetDate.getUTCMonth() + 11) % 12;
    const previousMonthYear =
      previousMonthIndex === 11 ? targetDate.getUTCFullYear() - 1 : targetDate.getUTCFullYear();
    days += getDaysInMonth(previousMonthYear, previousMonthIndex);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((targetDate.getTime() - birthDate.getTime()) / DAY_IN_MS);
  const totalMonths = years * 12 + months;
  const totalWeeks = Math.floor(totalDays / 7);

  const birthMonthIndex = birthDate.getUTCMonth();
  const birthDay = birthDate.getUTCDate();
  let nextBirthdayYear = targetDate.getUTCFullYear();
  let nextBirthday = new Date(
    Date.UTC(
      nextBirthdayYear,
      birthMonthIndex,
      clampBirthdayDay(nextBirthdayYear, birthMonthIndex, birthDay)
    )
  );

  if (nextBirthday < targetDate) {
    nextBirthdayYear += 1;
    nextBirthday = new Date(
      Date.UTC(
        nextBirthdayYear,
        birthMonthIndex,
        clampBirthdayDay(nextBirthdayYear, birthMonthIndex, birthDay)
      )
    );
  }

  const nextBirthdayDaysAway = Math.floor(
    (nextBirthday.getTime() - targetDate.getTime()) / DAY_IN_MS
  );

  return {
    years,
    months,
    days,
    totalMonths,
    totalWeeks,
    totalDays,
    nextBirthdayAge: years + (nextBirthdayDaysAway === 0 ? 0 : 1),
    nextBirthdayLabel: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(nextBirthday),
    nextBirthdayDaysAway,
  };
}

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('1990-06-15');
  const [targetDate, setTargetDate] = useState(getTodayValue());
  const copyResult = useCopyToClipboard();

  const result = useMemo(() => {
    if (!birthDate || !targetDate) {
      return {
        value: '',
        error: '',
        detail: 'Choose a birth date and comparison date to calculate an age.',
        breakdown: null as AgeBreakdown | null,
      };
    }

    const parsedBirthDate = parseDateInput(birthDate);
    const parsedTargetDate = parseDateInput(targetDate);

    if (!parsedBirthDate || !parsedTargetDate) {
      return {
        value: '',
        error: 'Enter valid calendar dates.',
        detail: '',
        breakdown: null as AgeBreakdown | null,
      };
    }

    if (parsedTargetDate < parsedBirthDate) {
      return {
        value: '',
        error: 'The comparison date cannot be earlier than the birth date.',
        detail: '',
        breakdown: null as AgeBreakdown | null,
      };
    }

    const breakdown = calculateAge(birthDate, targetDate);

    if (!breakdown) {
      return {
        value: '',
        error: 'Unable to calculate age for the selected dates.',
        detail: '',
        breakdown: null as AgeBreakdown | null,
      };
    }

    return {
      value: `${breakdown.years} years, ${breakdown.months} months, ${breakdown.days} days`,
      error: '',
      detail: `From ${formatLongDate(birthDate)} to ${formatLongDate(targetDate)}`,
      breakdown,
    };
  }, [birthDate, targetDate]);

  const handleClear = () => {
    setBirthDate('');
    setTargetDate(getTodayValue());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Age Calculator</CardTitle>
          <CardDescription>
            Calculate exact age between two dates, plus total days and the next birthday.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="birth-date" className="mb-2 block text-sm font-medium">
                Birth date
              </label>
              <Input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate((event.target as HTMLInputElement).value)}
                max={targetDate || undefined}
              />
            </div>
            <div>
              <label htmlFor="target-date" className="mb-2 block text-sm font-medium">
                Age at
              </label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate((event.target as HTMLInputElement).value)}
                min={birthDate || undefined}
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
          <CardDescription>{result.error ? 'Fix the selected dates to continue.' : result.detail}</CardDescription>
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
                  <CalendarDays className="h-3.5 w-3.5" />
                  Next birthday
                </div>
                <div className="mt-1 font-semibold">{result.breakdown.nextBirthdayLabel}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Turns {result.breakdown.nextBirthdayAge} in {formatNumber(result.breakdown.nextBirthdayDaysAway)} day
                  {result.breakdown.nextBirthdayDaysAway === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
