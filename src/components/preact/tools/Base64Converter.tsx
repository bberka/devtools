import { useState } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Copy, Check } from 'lucide-preact';

export function Base64Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          onClick={() => setMode('encode')}
        >
          Encode
        </Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          onClick={() => setMode('decode')}
        >
          Decode
        </Button>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            rows={8}
            className="font-mono"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleConvert} className="flex-1">
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {/* Output Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Output</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!output}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="w-full min-h-[200px] p-3 rounded-md bg-muted font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all">
            {output || 'Output will appear here...'}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
