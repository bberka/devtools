'use client';

import { useMemo, useState } from 'react';
import { ArrowRightLeft, CalendarIcon, Check, Clock3, Copy, Trash2 } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCopyToClipboard } from '@/hooks';
import { cn } from '@/lib/utils/cn';

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

const COMMON_TIME_ZONES = [
  'UTC',
  // Americas
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  // Europe
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Warsaw',
  'Europe/Istanbul',
  'Europe/Moscow',
  // Africa
  'Africa/Cairo',
  'Africa/Lagos',
  'Africa/Johannesburg',
  // Middle East & Asia
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
  // Oceania
  'Australia/Perth',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Pacific/Honolulu',
] as const;

const FALLBACK_TIME_ZONES = COMMON_TIME_ZONES;

const MAX_SEARCH_RESULTS = 50;

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

  const commonTimeZoneOptions = useMemo<TimeZoneOption[]>(
    () =>
      COMMON_TIME_ZONES.map((timeZone) => ({
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const copyResult = useCopyToClipboard();

  const filteredSourceOptions = useMemo(() => {
    const query = sourceSearch.trim().toLowerCase();
    if (!query) return commonTimeZoneOptions;
    return timeZoneOptions
      .filter((o) => o.label.toLowerCase().includes(query) || o.value.toLowerCase().includes(query))
      .slice(0, MAX_SEARCH_RESULTS);
  }, [sourceSearch, timeZoneOptions, commonTimeZoneOptions]);

  const filteredTargetOptions = useMemo(() => {
    const query = targetSearch.trim().toLowerCase();
    if (!query) return commonTimeZoneOptions;
    return timeZoneOptions
      .filter((o) => o.label.toLowerCase().includes(query) || o.value.toLowerCase().includes(query))
      .slice(0, MAX_SEARCH_RESULTS);
  }, [targetSearch, timeZoneOptions, commonTimeZoneOptions]);

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
            <label className="mb-2 block text-sm font-medium">Date and time</label>
            <div className="flex gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={(() => {
                      if (!inputValue) return undefined;
                      const [y, m, d] = inputValue.slice(0, 10).split('-').map(Number);
                      return new Date(y, m - 1, d);
                    })()}
                    onSelect={(date) => {
                      if (!date) return;
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, '0');
                      const d = String(date.getDate()).padStart(2, '0');
                      const time = inputValue.length >= 16 ? inputValue.slice(11, 16) : '00:00';
                      setInputValue(`${y}-${m}-${d}T${time}`);
                      setCalendarOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <IMaskInput
                mask="0000-00-00"
                value={inputValue.slice(0, 10)}
                onAccept={(datePart) => {
                  const time = inputValue.length >= 16 ? inputValue.slice(11, 16) : '00:00';
                  setInputValue(`${datePart}T${time}`);
                }}
                placeholder="YYYY-MM-DD"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono w-36"
              />
              <div className="flex items-center gap-1">
                <Select
                  value={inputValue.length >= 16 ? inputValue.slice(11, 13) : '00'}
                  onValueChange={(hour) => {
                    const date = inputValue.slice(0, 10) || new Date().toISOString().slice(0, 10);
                    const minute = inputValue.length >= 16 ? inputValue.slice(14, 16) : '00';
                    setInputValue(`${date}T${hour}:${minute}`);
                  }}
                >
                  <SelectTrigger className="w-18">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectGroup>
                      {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <span className="font-medium text-muted-foreground">:</span>
                <Select
                  value={inputValue.length >= 16 ? inputValue.slice(14, 16) : '00'}
                  onValueChange={(minute) => {
                    const date = inputValue.slice(0, 10) || new Date().toISOString().slice(0, 10);
                    const hour = inputValue.length >= 16 ? inputValue.slice(11, 13) : '00';
                    setInputValue(`${date}T${hour}:${minute}`);
                  }}
                >
                  <SelectTrigger className="w-18">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectGroup>
                      {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium">From</label>
              <Popover open={sourceOpen} onOpenChange={(open) => { setSourceOpen(open); if (!open) setSourceSearch(''); }}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal truncate">
                    <span className="truncate">{buildTimeZoneLabel(sourceTimeZone)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-full max-w-none overflow-hidden p-0" align="start">
                  <div className="border-b p-1">
                    <Input
                      value={sourceSearch}
                      onChange={(e) => setSourceSearch((e.target as HTMLInputElement).value)}
                      placeholder="Search time zones..."
                      className="h-9"
                      autoFocus
                    />
                  </div>
                  <ScrollArea className="h-60">
                    <div className="p-1">
                      {filteredSourceOptions.map((option) => (
                        <button
                          key={option.value}
                          className={cn(
                            'flex w-full cursor-default items-center truncate rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
                            sourceTimeZone === option.value && 'bg-accent font-medium'
                          )}
                          type="button"
                          onClick={() => { setSourceTimeZone(option.value); setSourceOpen(false); setSourceSearch(''); }}
                        >
                          {option.label}
                        </button>
                      ))}
                      {filteredSourceOptions.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No matching time zones</div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
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
              <Popover open={targetOpen} onOpenChange={(open) => { setTargetOpen(open); if (!open) setTargetSearch(''); }}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal truncate">
                    <span className="truncate">{buildTimeZoneLabel(targetTimeZone)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-full max-w-none overflow-hidden p-0" align="start">
                  <div className="border-b p-1">
                    <Input
                      value={targetSearch}
                      onChange={(e) => setTargetSearch((e.target as HTMLInputElement).value)}
                      placeholder="Search time zones..."
                      className="h-9"
                      autoFocus
                    />
                  </div>
                  <ScrollArea className="h-60">
                    <div className="p-1">
                      {filteredTargetOptions.map((option) => (
                        <button
                          key={option.value}
                          className={cn(
                            'flex w-full cursor-default items-center truncate rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
                            targetTimeZone === option.value && 'bg-accent font-medium'
                          )}
                          type="button"
                          onClick={() => { setTargetTimeZone(option.value); setTargetOpen(false); setTargetSearch(''); }}
                        >
                          {option.label}
                        </button>
                      ))}
                      {filteredTargetOptions.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No matching time zones</div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
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
                <div className="mt-1 text-sm text-muted-foreground" suppressHydrationWarning>
                  {formatOffset(result.utcDate, sourceTimeZone)}
                </div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Target input format
                </div>
                <div className="mt-1 font-mono text-base font-semibold">{targetInputValue}</div>
                <div className="mt-1 text-sm text-muted-foreground" suppressHydrationWarning>
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
