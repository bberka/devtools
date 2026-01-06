import { useState, useEffect } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Trash2 } from 'lucide-preact';

type Mode = 'to-date' | 'to-timestamp';
type Unit = 'seconds' | 'milliseconds';

const modeOptions = [
  { value: 'to-date', label: 'Timestamp → Date' },
  { value: 'to-timestamp', label: 'Date → Timestamp' },
];

const unitOptions = [
  { value: 'seconds', label: 'Seconds' },
  { value: 'milliseconds', label: 'Milliseconds' },
];

export function TimestampConverter() {
  const [mode, setMode] = useState<Mode>('to-date');
  const [unit, setUnit] = useState<Unit>('seconds');
  const [input, setInput] = useState('');
  const [results, setResults] = useState({
    iso: '',
    local: '',
    utc: '',
    relative: '',
    seconds: '',
    milliseconds: '',
  });

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(Math.abs(diff) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const suffix = diff > 0 ? 'ago' : 'from now';

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${suffix}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${suffix}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ${suffix}`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ${suffix}`;
  };

  useEffect(() => {
    if (!input) {
      setResults({ iso: '', local: '', utc: '', relative: '', seconds: '', milliseconds: '' });
      return;
    }

    try {
      if (mode === 'to-date') {
        const timestamp = parseFloat(input);
        const ms = unit === 'seconds' ? timestamp * 1000 : timestamp;
        const date = new Date(ms);

        if (isNaN(date.getTime())) {
          throw new Error('Invalid timestamp');
        }

        setResults({
          iso: date.toISOString(),
          local: date.toLocaleString(),
          utc: date.toUTCString(),
          relative: getRelativeTime(date),
          seconds: '',
          milliseconds: '',
        });
      } else {
        const date = new Date(input);

        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }

        setResults({
          iso: '',
          local: '',
          utc: '',
          relative: '',
          seconds: Math.floor(date.getTime() / 1000).toString(),
          milliseconds: date.getTime().toString(),
        });
      }
    } catch (error) {
      setResults({ iso: '', local: '', utc: '', relative: '', seconds: '', milliseconds: '' });
    }
  }, [input, mode, unit]);

  const handleNow = () => {
    if (mode === 'to-date') {
      const now = unit === 'seconds' ? Math.floor(Date.now() / 1000) : Date.now();
      setInput(now.toString());
    } else {
      setInput(new Date().toISOString());
    }
  };

  const handleClear = () => {
    setInput('');
    setResults({ iso: '', local: '', utc: '', relative: '', seconds: '', milliseconds: '' });
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Mode</label>
            <Select
              options={modeOptions}
              value={mode}
              onChange={(e) => setMode((e.target as HTMLSelectElement).value as Mode)}
            />
          </div>

          {mode === 'to-date' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Unit</label>
              <Select
                options={unitOptions}
                value={unit}
                onChange={(e) => setUnit((e.target as HTMLSelectElement).value as Unit)}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              {mode === 'to-date' ? 'Timestamp' : 'Date/Time'}
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={input}
                onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                placeholder={mode === 'to-date' ? '1640995200' : '2022-01-01T00:00:00Z'}
                className="font-mono"
              />
              <Button onClick={handleNow} variant="outline" size="sm">
                Now
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {mode === 'to-date' ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ISO 8601</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
                {results.iso || '-'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Local</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
                {results.local || '-'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">UTC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
                {results.utc || '-'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Relative</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
                {results.relative || '-'}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seconds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
                {results.seconds || '-'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Milliseconds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
                {results.milliseconds || '-'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
