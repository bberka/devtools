'use client';

import { useMemo, useState } from 'react';
import { ArrowRightLeft, Check, Clock3, Copy, Trash2 } from 'lucide-react';
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

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

type TimeZoneOption = {
  value: string;
  label: string;
};

const FALLBACK_TIME_ZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Africa/Cairo',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Perth',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

function getDefaultSourceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function getSupportedTimeZones(): string[] {
  const supportedValuesOf = Intl.supportedValuesOf as
    | ((key: 'timeZone') => string[])
    | undefined;

  if (typeof supportedValuesOf === 'function') {
    return supportedValuesOf('timeZone');
  }

  return [...FALLBACK_TIME_ZONES];
}

function buildTimeZoneLabel(timeZone: string): string {
  return timeZone.replace(/_/g, ' / ');
}

function getNowInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function parseDateTimeInput(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: 0,
  };

  const date = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  );

  if (
    date.getUTCFullYear() !== parts.year ||
    date.getUTCMonth() !== parts.month - 1 ||
    date.getUTCDate() !== parts.day ||
    parts.hour > 23 ||
    parts.minute > 59
  ) {
    return null;
  }

  return parts;
}

function datePartsToInputValue(parts: DateParts): string {
  const year = String(parts.year).padStart(4, '0');
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  const hour = String(parts.hour).padStart(2, '0');
  const minute = String(parts.minute).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getTimeZoneParts(date: Date, timeZone: string): DateParts {
  const parts = getFormatter(timeZone).formatToParts(date);
  const map = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)])
  ) as Record<string, number>;

  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second,
  };
}

function getTimeZoneOffsetMinutes(timestamp: number, timeZone: string): number {
  const parts = getTimeZoneParts(new Date(timestamp), timeZone);
  const utcFromParts = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return (utcFromParts - timestamp) / 60000;
}

function sameMinute(left: DateParts, right: DateParts): boolean {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute
  );
}

function zonedDateTimeToUtc(parts: DateParts, timeZone: string): Date | null {
  const utcGuess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  let timestamp = utcGuess;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offsetMinutes = getTimeZoneOffsetMinutes(timestamp, timeZone);
    const candidate = utcGuess - offsetMinutes * 60_000;
    const candidateParts = getTimeZoneParts(new Date(candidate), timeZone);

    timestamp = candidate;

    if (sameMinute(candidateParts, parts)) {
      return new Date(candidate);
    }
  }

  return null;
}

function formatDateInTimeZone(
  date: Date,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'full',
    timeStyle: 'long',
    ...options,
  }).format(date);
}

function formatOffset(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((part) => part.type === 'timeZoneName')?.value;

  return offsetPart ?? 'UTC';
}

export function TimezoneConverter() {
  const timeZoneOptions = useMemo<TimeZoneOption[]>(
    () =>
      getSupportedTimeZones().map((timeZone) => ({
        value: timeZone,
        label: buildTimeZoneLabel(timeZone),
      })),
    []
  );

  const defaultSourceTimeZone = useMemo(() => {
    const resolved = getDefaultSourceTimeZone();
    return timeZoneOptions.some((option) => option.value === resolved) ? resolved : 'UTC';
  }, [timeZoneOptions]);

  const [sourceTimeZone, setSourceTimeZone] = useState(defaultSourceTimeZone);
  const [targetTimeZone, setTargetTimeZone] = useState('UTC');
  const [inputValue, setInputValue] = useState(getNowInputValue());
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const copyResult = useCopyToClipboard();

  const filteredSourceOptions = useMemo(() => {
    const query = sourceSearch.trim().toLowerCase();

    if (!query) {
      return timeZoneOptions;
    }

    return timeZoneOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query)
    );
  }, [sourceSearch, timeZoneOptions]);

  const filteredTargetOptions = useMemo(() => {
    const query = targetSearch.trim().toLowerCase();

    if (!query) {
      return timeZoneOptions;
    }

    return timeZoneOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query)
    );
  }, [targetSearch, timeZoneOptions]);

  const result = useMemo(() => {
    const inputParts = parseDateTimeInput(inputValue);

    if (!inputValue) {
      return {
        value: '',
        detail: 'Choose a date and time to convert.',
        error: '',
        utcDate: null as Date | null,
      };
    }

    if (!inputParts) {
      return {
        value: '',
        detail: '',
        error: 'Enter a valid date and time.',
        utcDate: null as Date | null,
      };
    }

    const utcDate = zonedDateTimeToUtc(inputParts, sourceTimeZone);

    if (!utcDate) {
      return {
        value: '',
        detail: '',
        error:
          'This local time is invalid or ambiguous in the selected source time zone. Try a different minute.',
        utcDate: null as Date | null,
      };
    }

    return {
      value: formatDateInTimeZone(utcDate, targetTimeZone),
      detail: `${sourceTimeZone} → ${targetTimeZone}`,
      error: '',
      utcDate,
    };
  }, [inputValue, sourceTimeZone, targetTimeZone]);

  const targetInputValue = useMemo(() => {
    if (!result.utcDate) {
      return '';
    }

    return datePartsToInputValue(getTimeZoneParts(result.utcDate, targetTimeZone));
  }, [result.utcDate, targetTimeZone]);

  const sourceFormatted = useMemo(() => {
    if (!result.utcDate) {
      return '';
    }

    return formatDateInTimeZone(result.utcDate, sourceTimeZone);
  }, [result.utcDate, sourceTimeZone]);

  const utcFormatted = useMemo(() => {
    if (!result.utcDate) {
      return '';
    }

    return formatDateInTimeZone(result.utcDate, 'UTC');
  }, [result.utcDate]);

  const handleSwap = () => {
    setSourceTimeZone(targetTimeZone);
    setTargetTimeZone(sourceTimeZone);

    if (targetInputValue) {
      setInputValue(targetInputValue);
    }
  };

  const handleNow = () => {
    setInputValue(getNowInputValue());
  };

  const handleClear = () => {
    setInputValue('');
    setSourceTimeZone(defaultSourceTimeZone);
    setTargetTimeZone('UTC');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Timezone Converter</CardTitle>
          <CardDescription>
            Convert a local date and time between IANA time zones using browser-side formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="timezone-input" className="mb-2 block text-sm font-medium">
              Date and time
            </label>
            <Input
              id="timezone-input"
              type="datetime-local"
              value={inputValue}
              onChange={(event) => setInputValue((event.target as HTMLInputElement).value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium">From</label>
              <Select
                value={sourceTimeZone}
                onValueChange={setSourceTimeZone}
                open={sourceOpen}
                onOpenChange={(open) => {
                  setSourceOpen(open);
                  if (!open) {
                    setSourceSearch('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source time zone" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-1">
                    <Input
                      value={sourceSearch}
                      onChange={(event) =>
                        setSourceSearch((event.target as HTMLInputElement).value)
                      }
                      onKeyDown={(event) => event.stopPropagation()}
                      placeholder="Search time zones..."
                      className="h-9"
                      autoFocus
                    />
                  </div>
                  <SelectGroup>
                    {filteredSourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  {filteredSourceOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No matching time zones
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center lg:pb-0.5">
              <Button
                onClick={handleSwap}
                variant="outline"
                size="icon"
                aria-label="Swap time zones"
                className="h-11 w-full sm:w-11 lg:h-10 lg:w-10"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">To</label>
              <Select
                value={targetTimeZone}
                onValueChange={setTargetTimeZone}
                open={targetOpen}
                onOpenChange={(open) => {
                  setTargetOpen(open);
                  if (!open) {
                    setTargetSearch('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target time zone" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-1">
                    <Input
                      value={targetSearch}
                      onChange={(event) =>
                        setTargetSearch((event.target as HTMLInputElement).value)
                      }
                      onKeyDown={(event) => event.stopPropagation()}
                      placeholder="Search time zones..."
                      className="h-9"
                      autoFocus
                    />
                  </div>
                  <SelectGroup>
                    {filteredTargetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  {filteredTargetOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No matching time zones
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {result.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {result.error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleNow} variant="outline">
              <Clock3 className="mr-2 h-4 w-4" />
              Now
            </Button>
            <Button onClick={handleClear} variant="outline">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              onClick={() => copyResult.copyToClipboard(targetInputValue || result.value)}
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
          <CardTitle>Converted Time</CardTitle>
          <CardDescription>{result.error ? 'Adjust the date, time, or zone selection.' : result.detail}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 font-mono text-xl font-semibold tracking-tight sm:text-2xl">
            {result.value || '-'}
          </div>

          {result.utcDate && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Source time
                </div>
                <div className="mt-1 font-semibold">{sourceFormatted}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {formatOffset(result.utcDate, sourceTimeZone)}
                </div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Target input format
                </div>
                <div className="mt-1 font-mono text-base font-semibold">{targetInputValue}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {formatOffset(result.utcDate, targetTimeZone)}
                </div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  UTC reference
                </div>
                <div className="mt-1 font-semibold">{utcFormatted}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {result.utcDate.toISOString()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
