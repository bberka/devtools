'use client';

import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { DatePicker } from '../ui/date-picker';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Trash2 } from 'lucide-react';

type Unit = 'seconds' | 'milliseconds';

const unitOptions = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'milliseconds', label: 'Milliseconds' },
];

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const secs = Math.floor(Math.abs(diff) / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const suffix = diff > 0 ? 'ago' : 'from now';
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${suffix}`;
  if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''} ${suffix}`;
  if (mins > 0) return `${mins} minute${mins > 1 ? 's' : ''} ${suffix}`;
  return `${secs} second${secs > 1 ? 's' : ''} ${suffix}`;
}

function deriveDateFromTimestamp(ts: string, unit: Unit): { date: string; hour: string; minute: string } | null {
  const num = parseFloat(ts);
  if (isNaN(num)) return null;
  const d = new Date(unit === 'seconds' ? num * 1000 : num);
  if (isNaN(d.getTime())) return null;
  return {
    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    hour: String(d.getHours()).padStart(2, '0'),
    minute: String(d.getMinutes()).padStart(2, '0'),
  };
}

function deriveTimestampFromDate(date: string, hour: string, minute: string, unit: Unit): string | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const d = new Date(`${date}T${hour}:${minute}:00`);
  if (isNaN(d.getTime())) return null;
  return (unit === 'seconds' ? Math.floor(d.getTime() / 1000) : d.getTime()).toString();
}

export function TimestampConverter() {
  const [unit, setUnit] = useState<Unit>('seconds');
  const [timestampInput, setTimestampInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [hourInput, setHourInput] = useState('00');
  const [minuteInput, setMinuteInput] = useState('00');

  const handleTimestampChange = (raw: string) => {
    const masked = raw.replace(/[^\d.-]/g, '');
    setTimestampInput(masked);
    const derived = deriveDateFromTimestamp(masked, unit);
    if (derived) {
      setDateInput(derived.date);
      setHourInput(derived.hour);
      setMinuteInput(derived.minute);
    }
  };

  const handleDateTimeChange = (date: string, hour: string, minute: string) => {
    setDateInput(date);
    setHourInput(hour);
    setMinuteInput(minute);
    const ts = deriveTimestampFromDate(date, hour, minute, unit);
    if (ts) setTimestampInput(ts);
  };

  const handleUnitChange = (newUnit: Unit) => {
    setUnit(newUnit);
    if (dateInput) {
      const ts = deriveTimestampFromDate(dateInput, hourInput, minuteInput, newUnit);
      if (ts) setTimestampInput(ts);
    } else if (timestampInput) {
      const derived = deriveDateFromTimestamp(timestampInput, newUnit);
      if (derived) {
        setDateInput(derived.date);
        setHourInput(derived.hour);
        setMinuteInput(derived.minute);
      }
    }
  };

  const handleNow = () => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    handleDateTimeChange(date, hour, minute);
  };

  const handleClear = () => {
    setTimestampInput('');
    setDateInput('');
    setHourInput('00');
    setMinuteInput('00');
  };

  const results = useMemo(() => {
    if (!dateInput || !/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return null;
    const date = new Date(`${dateInput}T${hourInput}:${minuteInput}:00`);
    if (isNaN(date.getTime())) return null;
    return {
      iso: date.toISOString(),
      local: date.toLocaleString(),
      utc: date.toUTCString(),
      relative: getRelativeTime(date),
    };
  }, [dateInput, hourInput, minuteInput]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unix Timestamp Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Unit</label>
            <Select value={unit} onValueChange={(v) => handleUnitChange(v as Unit)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {unitOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Timestamp</label>
              <Input
                type="text"
                value={timestampInput}
                onChange={(e) => handleTimestampChange((e.target as HTMLInputElement).value)}
                placeholder={unit === 'seconds' ? '1640995200' : '1640995200000'}
                className="font-mono"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date / Time</label>
              <div className="flex flex-wrap gap-2 items-center">
                <DatePicker
                  value={dateInput}
                  onChange={(value) => {
                    handleDateTimeChange(value, hourInput, minuteInput);
                  }}
                  className="w-40"
                />
                <div className="flex items-center gap-1">
                  <Select
                    value={hourInput}
                    onValueChange={(h) => handleDateTimeChange(dateInput, h, minuteInput)}
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
                    value={minuteInput}
                    onValueChange={(m) => handleDateTimeChange(dateInput, hourInput, m)}
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
          </div>

          <div className="flex gap-2">
            <Button onClick={handleNow} variant="outline" size="sm">Now</Button>
            <Button onClick={handleClear} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">ISO 8601</CardTitle></CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">{results.iso}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Local</CardTitle></CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">{results.local}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">UTC</CardTitle></CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">{results.utc}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Relative</CardTitle></CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">{results.relative}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
