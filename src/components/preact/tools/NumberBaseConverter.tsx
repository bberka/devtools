import { useState, useEffect } from 'preact/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-preact';

type Base = 'binary' | 'octal' | 'decimal' | 'hex';

const baseOptions = [
  { value: 'binary', label: 'Binary (2)' },
  { value: 'octal', label: 'Octal (8)' },
  { value: 'decimal', label: 'Decimal (10)' },
  { value: 'hex', label: 'Hexadecimal (16)' },
];

const baseMap: Record<Base, number> = {
  binary: 2,
  octal: 8,
  decimal: 10,
  hex: 16,
};

export function NumberBaseConverter() {
  const [inputBase, setInputBase] = useState<Base>('decimal');
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState({
    binary: '',
    octal: '',
    decimal: '',
    hex: '',
  });
  const [error, setError] = useState('');

  const handleClear = () => {
    setInputValue('');
    setResults({ binary: '', octal: '', decimal: '', hex: '' });
    setError('');
  };

  useEffect(() => {
    if (!inputValue) {
      setResults({ binary: '', octal: '', decimal: '', hex: '' });
      setError('');
      return;
    }

    try {
      const decimal = parseInt(inputValue, baseMap[inputBase]);

      if (isNaN(decimal)) {
        setError('Invalid input for selected base');
        return;
      }

      setError('');
      setResults({
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        decimal: decimal.toString(10),
        hex: decimal.toString(16).toUpperCase(),
      });
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    }
  }, [inputValue, inputBase]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Base</label>
            <Select
              options={baseOptions}
              value={inputBase}
              onChange={(e) => setInputBase((e.target as HTMLSelectElement).value as Base)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Value</label>
            <Input
              type="text"
              value={inputValue}
              onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
              placeholder="Enter number..."
              className="font-mono"
            />
          </div>
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          <Button onClick={handleClear} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Binary (Base 2)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
              {results.binary || '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Octal (Base 8)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
              {results.octal || '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Decimal (Base 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
              {results.decimal || '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hexadecimal (Base 16)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
              {results.hex || '-'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
