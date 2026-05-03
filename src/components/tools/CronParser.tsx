'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, Check, Clock, Copy, Settings2, Trash2 } from 'lucide-react';
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

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

interface NextRun {
  date: string;
  time: string;
  fromNow: string;
}

type BuilderMode =
  | 'every-minutes'
  | 'hourly'
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const BUILDER_MODE_OPTIONS: Array<{ value: BuilderMode; label: string }> = [
  { value: 'every-minutes', label: 'Every N minutes' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom expression' },
];

const presets = [
  { value: '* * * * *', label: 'Every minute' },
  { value: '*/15 * * * *', label: 'Every 15 minutes' },
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 0 * * *', label: 'Every day at midnight' },
  { value: '0 9 * * 1-5', label: 'Every weekday at 9 AM' },
  { value: '0 0 * * 0', label: 'Every Sunday at midnight' },
  { value: '0 0 1 * *', label: 'First day of every month' },
];

function parseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function isValidRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function validateCronField(field: string, min: number, max: number, label: string) {
  const segments = field.split(',');

  segments.forEach((segment) => {
    const trimmed = segment.trim();

    if (!trimmed) {
      throw new Error(`${label} contains an empty segment.`);
    }

    if (trimmed === '*') {
      return;
    }

    const stepParts = trimmed.split('/');

    if (stepParts.length > 2) {
      throw new Error(`${label} has an invalid step value.`);
    }

    const base = stepParts[0];
    const step = stepParts[1];

    if (step) {
      const stepValue = parseNumber(step);
      if (stepValue === null || stepValue <= 0) {
        throw new Error(`${label} step must be a positive integer.`);
      }
    }

    if (base === '*') {
      return;
    }

    if (base.includes('-')) {
      const [startText, endText] = base.split('-');
      const start = parseNumber(startText);
      const end = parseNumber(endText);

      if (
        start === null ||
        end === null ||
        !isValidRange(start, min, max) ||
        !isValidRange(end, min, max) ||
        start > end
      ) {
        throw new Error(`${label} range must stay between ${min} and ${max}.`);
      }

      return;
    }

    const value = parseNumber(base);

    if (value === null || !isValidRange(value, min, max)) {
      throw new Error(`${label} must stay between ${min} and ${max}.`);
    }
  });
}

function parseCronExpression(expression: string): CronParts {
  const cronParts = expression.trim().split(/\s+/);

  if (cronParts.length !== 5) {
    throw new Error(
      'Cron expression must have exactly 5 fields: minute hour day-of-month month day-of-week.'
    );
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = cronParts;

  validateCronField(minute, 0, 59, 'Minute');
  validateCronField(hour, 0, 23, 'Hour');
  validateCronField(dayOfMonth, 1, 31, 'Day of month');
  validateCronField(month, 1, 12, 'Month');
  validateCronField(dayOfWeek, 0, 6, 'Day of week');

  return {
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
  };
}

function expandField(field: string, min: number, max: number): Set<number> {
  const values = new Set<number>();

  const addRange = (start: number, end: number, step = 1) => {
    for (let value = start; value <= end; value += step) {
      values.add(value);
    }
  };

  field.split(',').forEach((segment) => {
    const trimmed = segment.trim();
    const [base, stepText] = trimmed.split('/');
    const step = stepText ? Number(stepText) : 1;

    if (base === '*') {
      addRange(min, max, step);
      return;
    }

    if (base.includes('-')) {
      const [startText, endText] = base.split('-');
      addRange(Number(startText), Number(endText), step);
      return;
    }

    const singleValue = Number(base);
    if (Number.isInteger(singleValue)) {
      values.add(singleValue);
    }
  });

  return values;
}

function matchesCron(date: Date, parts: CronParts): boolean {
  const minuteValues = expandField(parts.minute, 0, 59);
  const hourValues = expandField(parts.hour, 0, 23);
  const dayOfMonthValues = expandField(parts.dayOfMonth, 1, 31);
  const monthValues = expandField(parts.month, 1, 12);
  const dayOfWeekValues = expandField(parts.dayOfWeek, 0, 6);

  return (
    minuteValues.has(date.getMinutes()) &&
    hourValues.has(date.getHours()) &&
    dayOfMonthValues.has(date.getDate()) &&
    monthValues.has(date.getMonth() + 1) &&
    dayOfWeekValues.has(date.getDay())
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  }

  if (diffHours > 0) {
    return `in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  }

  if (diffMins > 0) {
    return `in ${diffMins} minute${diffMins === 1 ? '' : 's'}`;
  }

  return 'now';
}

function calculateNextRuns(parts: CronParts): NextRun[] {
  const runs: NextRun[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  let checked = 0;
  const maxChecks = 60 * 24 * 366;

  while (runs.length < 5 && checked < maxChecks) {
    if (matchesCron(cursor, parts)) {
      runs.push({
        date: cursor.toLocaleDateString(),
        time: cursor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fromNow: getRelativeTime(cursor),
      });
    }

    cursor.setMinutes(cursor.getMinutes() + 1);
    checked += 1;
  }

  return runs;
}

function describeNumericField(
  field: string,
  singular: string,
  plural: string
): string | null {
  if (field === '*') {
    return null;
  }

  if (field.startsWith('*/')) {
    return `every ${field.slice(2)} ${plural}`;
  }

  if (field.includes(',')) {
    return `${plural} ${field}`;
  }

  if (field.includes('-')) {
    return `${singular}s ${field}`;
  }

  return `${singular} ${field}`;
}

function generateDescription(parts: CronParts): string {
  const minuteDescription = describeNumericField(parts.minute, 'minute', 'minutes');
  const hourDescription = describeNumericField(parts.hour, 'hour', 'hours');
  const dayDescription =
    parts.dayOfMonth === '*'
      ? ''
      : parts.dayOfMonth.includes(',')
        ? `on days ${parts.dayOfMonth} of the month`
        : `on day ${parts.dayOfMonth} of the month`;

  const monthDescription =
    parts.month === '*'
      ? ''
      : parts.month.includes(',')
        ? `in months ${parts.month}`
        : `in ${MONTH_NAMES[Number(parts.month) - 1] ?? `month ${parts.month}`}`;

  let weekdayDescription = '';

  if (parts.dayOfWeek !== '*') {
    if (parts.dayOfWeek === '1-5') {
      weekdayDescription = 'on weekdays';
    } else if (parts.dayOfWeek.includes(',')) {
      weekdayDescription = `on ${parts.dayOfWeek
        .split(',')
        .map((value) => DAY_NAMES[Number(value)] ?? value)
        .join(', ')}`;
    } else if (parts.dayOfWeek.includes('-')) {
      const [start, end] = parts.dayOfWeek.split('-').map(Number);
      weekdayDescription = `from ${DAY_NAMES[start] ?? start} through ${
        DAY_NAMES[end] ?? end
      }`;
    } else {
      weekdayDescription = `on ${DAY_NAMES[Number(parts.dayOfWeek)] ?? parts.dayOfWeek}`;
    }
  }

  let timeDescription = 'every minute';

  if (parts.minute !== '*' && parts.hour === '*') {
    timeDescription = `at minute ${parts.minute} of every hour`;
  } else if (parts.minute === '*' && parts.hour !== '*') {
    timeDescription = `every minute during hour ${parts.hour}`;
  } else if (parts.minute !== '*' && parts.hour !== '*') {
    timeDescription = `at ${parts.hour.padStart(2, '0')}:${parts.minute.padStart(2, '0')}`;
  } else if (parts.minute.startsWith('*/') && parts.hour === '*') {
    timeDescription = `every ${parts.minute.slice(2)} minutes`;
  }

  return [
    timeDescription,
    minuteDescription && parts.minute.startsWith('*/') ? null : null,
    hourDescription && parts.hour === '*' ? null : null,
    dayDescription,
    monthDescription,
    weekdayDescription,
  ]
    .filter(Boolean)
    .join(', ');
}

function buildExpression(
  mode: BuilderMode,
  values: {
    everyMinutesInterval: string;
    hourlyMinute: string;
    scheduleHour: string;
    scheduleMinute: string;
    weeklyDay: string;
    monthlyDay: string;
    yearlyMonth: string;
    yearlyDay: string;
  }
): string {
  switch (mode) {
    case 'every-minutes':
      return `*/${values.everyMinutesInterval} * * * *`;
    case 'hourly':
      return `${values.hourlyMinute} * * * *`;
    case 'daily':
      return `${values.scheduleMinute} ${values.scheduleHour} * * *`;
    case 'weekdays':
      return `${values.scheduleMinute} ${values.scheduleHour} * * 1-5`;
    case 'weekly':
      return `${values.scheduleMinute} ${values.scheduleHour} * * ${values.weeklyDay}`;
    case 'monthly':
      return `${values.scheduleMinute} ${values.scheduleHour} ${values.monthlyDay} * *`;
    case 'yearly':
      return `${values.scheduleMinute} ${values.scheduleHour} ${values.yearlyDay} ${values.yearlyMonth} *`;
    default:
      return '';
  }
}

export function CronParser() {
  const [expression, setExpression] = useState('0 9 * * 1-5');
  const [parts, setParts] = useState<CronParts | null>(null);
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState<NextRun[]>([]);
  const [error, setError] = useState('');
  const [builderMode, setBuilderMode] = useState<BuilderMode>('weekdays');
  const [everyMinutesInterval, setEveryMinutesInterval] = useState('15');
  const [hourlyMinute, setHourlyMinute] = useState('0');
  const [scheduleHour, setScheduleHour] = useState('9');
  const [scheduleMinute, setScheduleMinute] = useState('0');
  const [weeklyDay, setWeeklyDay] = useState('1');
  const [monthlyDay, setMonthlyDay] = useState('1');
  const [yearlyMonth, setYearlyMonth] = useState('1');
  const [yearlyDay, setYearlyDay] = useState('1');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const builderExpression = useMemo(
    () =>
      buildExpression(builderMode, {
        everyMinutesInterval,
        hourlyMinute,
        scheduleHour,
        scheduleMinute,
        weeklyDay,
        monthlyDay,
        yearlyMonth,
        yearlyDay,
      }),
    [
      builderMode,
      everyMinutesInterval,
      hourlyMinute,
      scheduleHour,
      scheduleMinute,
      weeklyDay,
      monthlyDay,
      yearlyMonth,
      yearlyDay,
    ]
  );

  useEffect(() => {
    const trimmed = expression.trim();

    if (!trimmed) {
      setParts(null);
      setDescription('');
      setNextRuns([]);
      setError('');
      return;
    }

    try {
      const parsed = parseCronExpression(trimmed);
      setParts(parsed);
      setDescription(generateDescription(parsed));
      setNextRuns(calculateNextRuns(parsed));
      setError('');
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'Invalid cron expression');
      setParts(null);
      setDescription('');
      setNextRuns([]);
    }
  }, [expression]);

  useEffect(() => {
    if (builderMode !== 'custom' && builderExpression) {
      setExpression(builderExpression);
    }
  }, [builderExpression, builderMode]);

  const handleManualExpressionChange = (value: string) => {
    setBuilderMode('custom');
    setExpression(value);
  };

  const handleClear = () => {
    setExpression('');
    setParts(null);
    setDescription('');
    setNextRuns([]);
    setError('');
    setBuilderMode('custom');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Cron Builder
          </CardTitle>
          <CardDescription>
            Build a cron expression with guided scheduling options, or switch to manual mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule type</label>
              <Select
                value={builderMode}
                onValueChange={(value) => setBuilderMode(value as BuilderMode)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a schedule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {BUILDER_MODE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {builderMode === 'every-minutes' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Interval (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  max="59"
                  value={everyMinutesInterval}
                  onChange={(event) =>
                    setEveryMinutesInterval((event.target as HTMLInputElement).value || '1')
                  }
                  className="font-mono"
                />
              </div>
            )}

            {builderMode === 'hourly' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Minute of the hour</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={hourlyMinute}
                  onChange={(event) =>
                    setHourlyMinute((event.target as HTMLInputElement).value || '0')
                  }
                  className="font-mono"
                />
              </div>
            )}

            {(builderMode === 'daily' ||
              builderMode === 'weekdays' ||
              builderMode === 'weekly' ||
              builderMode === 'monthly' ||
              builderMode === 'yearly') && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hour</label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={scheduleHour}
                    onChange={(event) =>
                      setScheduleHour((event.target as HTMLInputElement).value || '0')
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minute</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={scheduleMinute}
                    onChange={(event) =>
                      setScheduleMinute((event.target as HTMLInputElement).value || '0')
                    }
                    className="font-mono"
                  />
                </div>
              </>
            )}

            {builderMode === 'weekly' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Day of week</label>
                <Select value={weeklyDay} onValueChange={setWeeklyDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weekday" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {DAY_NAMES.map((day, index) => (
                        <SelectItem key={day} value={String(index)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {builderMode === 'monthly' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Day of month</label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={monthlyDay}
                  onChange={(event) =>
                    setMonthlyDay((event.target as HTMLInputElement).value || '1')
                  }
                  className="font-mono"
                />
              </div>
            )}

            {builderMode === 'yearly' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Month</label>
                  <Select value={yearlyMonth} onValueChange={setYearlyMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {MONTH_NAMES.map((month, index) => (
                          <SelectItem key={month} value={String(index + 1)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Day</label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={yearlyDay}
                    onChange={(event) =>
                      setYearlyDay((event.target as HTMLInputElement).value || '1')
                    }
                    className="font-mono"
                  />
                </div>
              </>
            )}
          </div>

          {builderMode !== 'custom' && (
            <div className="rounded-md border bg-muted/30 px-4 py-3">
              <div className="text-sm font-medium">Generated expression</div>
              <div className="mt-1 font-mono text-sm">{builderExpression || '-'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cron Expression
          </CardTitle>
          <CardDescription>Enter or refine a 5-field cron expression manually.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={expression}
                onChange={(event) =>
                  handleManualExpressionChange((event.target as HTMLInputElement).value)
                }
                placeholder="0 9 * * 1-5"
                className="flex-1 font-mono"
              />
              <Button
                onClick={() => copyToClipboard(expression)}
                variant={isCopied ? 'default' : 'outline'}
                size="sm"
                disabled={!expression}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs text-muted-foreground sm:grid-cols-3 lg:grid-cols-5">
              <div>
                Minute
                <br />
                (0-59)
              </div>
              <div>
                Hour
                <br />
                (0-23)
              </div>
              <div>
                Day
                <br />
                (1-31)
              </div>
              <div>
                Month
                <br />
                (1-12)
              </div>
              <div>
                Weekday
                <br />
                (0-6)
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick presets</label>
            <Select onValueChange={(value) => value && setExpression(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a preset..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {presets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md bg-muted p-4">
            <div className="mb-2 text-sm font-medium">Supported characters</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>
                <code className="rounded bg-background px-1 py-0.5">*</code> - Any value
              </div>
              <div>
                <code className="rounded bg-background px-1 py-0.5">,</code> - Value list
              </div>
              <div>
                <code className="rounded bg-background px-1 py-0.5">-</code> - Range
              </div>
              <div>
                <code className="rounded bg-background px-1 py-0.5">/</code> - Step values
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{description}</p>
          </CardContent>
        </Card>
      )}

      {parts && (
        <Card>
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
            <CardDescription>Cron expression components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm font-medium">Minute</div>
                <div className="rounded bg-muted p-2 font-mono text-sm">{parts.minute}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Hour</div>
                <div className="rounded bg-muted p-2 font-mono text-sm">{parts.hour}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Day of Month</div>
                <div className="rounded bg-muted p-2 font-mono text-sm">
                  {parts.dayOfMonth}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Month</div>
                <div className="rounded bg-muted p-2 font-mono text-sm">{parts.month}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Day of Week</div>
                <div className="rounded bg-muted p-2 font-mono text-sm">{parts.dayOfWeek}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {nextRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Scheduled Runs</CardTitle>
            <CardDescription>Upcoming execution times from your current local time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nextRuns.map((run, index) => (
                <div
                  key={`${run.date}-${run.time}-${index}`}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{run.date}</div>
                    <div className="text-sm text-muted-foreground">{run.time}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{run.fromNow}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
