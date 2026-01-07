import { useState, useEffect } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Input } from '@/components/preact/ui/input';
import { Button } from '@/components/preact/ui/button';
import { Select } from '@/components/preact/ui/select';
import { Calendar, Clock, AlertCircle, Copy, Check } from 'lucide-preact';
import { useCopyToClipboard } from '../hooks';

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

export function CronParser() {
  const [expression, setExpression] = useState('0 9 * * 1-5');
  const [parts, setParts] = useState<CronParts | null>(null);
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState<NextRun[]>([]);
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  useEffect(() => {
    parseCron(expression);
  }, [expression]);

  const parseCron = (expr: string) => {
    const trimmed = expr.trim();
    if (!trimmed) {
      setParts(null);
      setDescription('');
      setNextRuns([]);
      setError('');
      return;
    }

    try {
      const cronParts = trimmed.split(/\s+/);

      if (cronParts.length !== 5) {
        throw new Error('Cron expression must have exactly 5 fields (minute hour day month weekday)');
      }

      const [minute, hour, dayOfMonth, month, dayOfWeek] = cronParts;

      setParts({ minute, hour, dayOfMonth, month, dayOfWeek });
      setDescription(generateDescription({ minute, hour, dayOfMonth, month, dayOfWeek }));
      setNextRuns(calculateNextRuns({ minute, hour, dayOfMonth, month, dayOfWeek }));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid cron expression');
      setParts(null);
      setDescription('');
      setNextRuns([]);
    }
  };

  const generateDescription = (cronParts: CronParts): string => {
    const { minute, hour, dayOfMonth, month, dayOfWeek } = cronParts;

    let desc = 'At ';

    // Time
    if (hour === '*' && minute === '*') {
      desc = 'Every minute';
    } else if (hour === '*') {
      desc += `minute ${minute} of every hour`;
    } else if (minute === '0') {
      desc += `${hour}:00`;
    } else {
      desc += `${hour}:${minute.padStart(2, '0')}`;
    }

    // Day of month
    if (dayOfMonth !== '*') {
      desc += `, on day ${dayOfMonth} of the month`;
    }

    // Month
    if (month !== '*') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNum = parseInt(month);
      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        desc += `, only in ${monthNames[monthNum - 1]}`;
      } else {
        desc += `, in month ${month}`;
      }
    }

    // Day of week
    if (dayOfWeek !== '*') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      if (dayOfWeek.includes('-')) {
        const [start, end] = dayOfWeek.split('-').map(d => parseInt(d));
        if (!isNaN(start) && !isNaN(end)) {
          desc += `, ${dayNames[start]} through ${dayNames[end]}`;
        }
      } else if (dayOfWeek.includes(',')) {
        const days = dayOfWeek.split(',').map(d => {
          const num = parseInt(d);
          return !isNaN(num) ? dayNames[num] : d;
        });
        desc += `, only on ${days.join(', ')}`;
      } else {
        const dayNum = parseInt(dayOfWeek);
        if (!isNaN(dayNum)) {
          desc += `, only on ${dayNames[dayNum]}`;
        }
      }
    }

    return desc;
  };

  const calculateNextRuns = (cronParts: CronParts): NextRun[] => {
    // Simplified next run calculation (would need a proper library for accurate calculations)
    const runs: NextRun[] = [];
    const now = new Date();

    try {
      for (let i = 0; i < 5; i++) {
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + i);

        runs.push({
          date: futureDate.toLocaleDateString(),
          time: `${cronParts.hour.padStart(2, '0')}:${cronParts.minute.padStart(2, '0')}`,
          fromNow: getRelativeTime(futureDate),
        });
      }
    } catch (e) {
      // Ignore calculation errors
    }

    return runs;
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
    if (diffMins > 0) return `in ${diffMins} minute${diffMins === 1 ? '' : 's'}`;
    return 'now';
  };

  const presets = [
    { value: '* * * * *', label: 'Every minute' },
    { value: '0 * * * *', label: 'Every hour' },
    { value: '0 0 * * *', label: 'Every day at midnight' },
    { value: '0 9 * * 1-5', label: 'Every weekday at 9 AM' },
    { value: '0 0 * * 0', label: 'Every Sunday at midnight' },
    { value: '0 0 1 * *', label: 'First day of every month' },
  ];


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cron Expression
          </CardTitle>
          <CardDescription>Enter or build a cron expression</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={expression}
                onInput={(e) => setExpression((e.target as HTMLInputElement).value)}
                placeholder="0 9 * * 1-5"
                className="font-mono flex-1"
              />
              <Button
                onClick={() => copyToClipboard(expression)}
                variant={isCopied ? "default" : "outline"}
                size="sm"
                disabled={!expression}
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground text-center">
              <div>Minute<br/>(0-59)</div>
              <div>Hour<br/>(0-23)</div>
              <div>Day<br/>(1-31)</div>
              <div>Month<br/>(1-12)</div>
              <div>Weekday<br/>(0-6)</div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Presets:</label>
            <Select
              value=""
              options={presets}
              onChange={(e: Event) => {
                const value = (e.target as HTMLSelectElement).value;
                if (value) setExpression(value);
              }}
            >
              <option value="">Select a preset...</option>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <div className="text-sm font-medium mb-2">Special Characters:</div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div><code className="bg-background px-1 py-0.5 rounded">*</code> - Any value</div>
              <div><code className="bg-background px-1 py-0.5 rounded">,</code> - Value list (e.g., 1,3,5)</div>
              <div><code className="bg-background px-1 py-0.5 rounded">-</code> - Range (e.g., 1-5)</div>
              <div><code className="bg-background px-1 py-0.5 rounded">/</code> - Step values (e.g., */5 = every 5)</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Minute</div>
                <div className="bg-muted p-2 rounded font-mono text-sm">{parts.minute}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Hour</div>
                <div className="bg-muted p-2 rounded font-mono text-sm">{parts.hour}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Day of Month</div>
                <div className="bg-muted p-2 rounded font-mono text-sm">{parts.dayOfMonth}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Month</div>
                <div className="bg-muted p-2 rounded font-mono text-sm">{parts.month}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Day of Week</div>
                <div className="bg-muted p-2 rounded font-mono text-sm">{parts.dayOfWeek}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {nextRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Scheduled Runs</CardTitle>
            <CardDescription>Upcoming execution times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nextRuns.map((run, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-md">
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
