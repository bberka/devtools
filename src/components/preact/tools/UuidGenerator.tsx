import { useState } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select } from '../ui/select';
import { Copy, Check } from 'lucide-preact';
import { useCopyToClipboard } from '../hooks';

type UuidType = 'v4' | 'v7' | 'snowflake';

const typeOptions = [
  { value: 'v4', label: 'UUID v4 (Random)' },
  { value: 'v7', label: 'UUID v7 (Timestamp)' },
  { value: 'snowflake', label: 'Snowflake ID' },
];

const countOptions = [
  { value: '1', label: '1' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
];

export function UuidGenerator() {
  const [type, setType] = useState<UuidType>('v4');
  const [count, setCount] = useState('1');
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();

  const generateV4 = () => {
    return crypto.randomUUID();
  };

  const generateV7 = () => {
    // UUID v7: timestamp-based
    const timestamp = Date.now();
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8, 12)}-7${randomBytes.slice(0, 3)}-${randomBytes.slice(3, 7)}-${randomBytes.slice(7, 19)}`;
  };

  const generateSnowflake = () => {
    // Snowflake ID: 64-bit integer (as string for JavaScript safety)
    const timestamp = Date.now() - 1640995200000; // Custom epoch (2022-01-01)
    const workerId = Math.floor(Math.random() * 32); // 5 bits
    const processId = Math.floor(Math.random() * 32); // 5 bits
    const sequence = Math.floor(Math.random() * 4096); // 12 bits

    return ((BigInt(timestamp) << 22n) | (BigInt(workerId) << 17n) | (BigInt(processId) << 12n) | BigInt(sequence)).toString();
  };

  const handleGenerate = () => {
    const generator = type === 'v4' ? generateV4 : type === 'v7' ? generateV7 : generateSnowflake;
    const newUuids = Array.from({ length: parseInt(count) }, () => generator());
    setUuids(newUuids);
  };

  const handleCopy = async (index: number) => {
    await copyToClipboard(uuids[index]);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    await copyToClipboard(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
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
            <label className="text-sm font-medium mb-2 block">Type</label>
            <Select
              options={typeOptions}
              value={type}
              onChange={(e) => setType((e.target as HTMLSelectElement).value as UuidType)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Count</label>
            <Select
              options={countOptions}
              value={count}
              onChange={(e) => setCount((e.target as HTMLSelectElement).value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button onClick={handleGenerate} className="w-full">
        Generate
      </Button>

      {/* Results */}
      {uuids.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Generated IDs</CardTitle>
            <Button
              variant={copiedAll ? "default" : "ghost"}
              size="sm"
              onClick={handleCopyAll}
            >
              {copiedAll ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copy All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uuids.map((uuid, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div className="flex-1 p-2 rounded-md bg-muted font-mono text-sm break-all">
                    {uuid}
                  </div>
                  <Button
                    variant={copiedIndex === index ? "default" : "ghost"}
                    size="icon"
                    onClick={() => handleCopy(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
