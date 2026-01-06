import { useState } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { Select } from '@/components/preact/ui/select';
import { Copy, Quote, Trash2, ArrowLeftRight } from 'lucide-preact';

type EscapeMode = 'javascript' | 'json' | 'html' | 'xml' | 'csv' | 'sql' | 'regex';

export function TextEscape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<EscapeMode>('javascript');
  const [error, setError] = useState('');

  const escapeText = (text: string, escapeMode: EscapeMode): string => {
    if (!text) return '';

    switch (escapeMode) {
      case 'javascript':
        return text
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\b/g, '\\b')
          .replace(/\f/g, '\\f');

      case 'json':
        return JSON.stringify(text).slice(1, -1);

      case 'html':
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

      case 'xml':
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

      case 'csv':
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          return '"' + text.replace(/"/g, '""') + '"';
        }
        return text;

      case 'sql':
        return text.replace(/'/g, "''");

      case 'regex':
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      default:
        return text;
    }
  };

  const unescapeText = (text: string, escapeMode: EscapeMode): string => {
    if (!text) return '';

    try {
      switch (escapeMode) {
        case 'javascript':
          return text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\b/g, '\b')
            .replace(/\\f/g, '\f')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');

        case 'json':
          return JSON.parse('"' + text + '"');

        case 'html':
          return text
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');

        case 'xml':
          return text
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, '&');

        case 'csv':
          if (text.startsWith('"') && text.endsWith('"')) {
            return text.slice(1, -1).replace(/""/g, '"');
          }
          return text;

        case 'sql':
          return text.replace(/''/g, "'");

        case 'regex':
          return text.replace(/\\([.*+?^${}()|[\]\\])/g, '$1');

        default:
          return text;
      }
    } catch (e) {
      throw new Error('Invalid escaped text for the selected mode');
    }
  };

  const handleEscape = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const escaped = escapeText(input, mode);
      setOutput(escaped);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to escape text');
      setOutput('');
    }
  };

  const handleUnescape = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const unescaped = unescapeText(input, mode);
      setOutput(unescaped);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unescape text');
      setOutput('');
    }
  };

  const handleSwap = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            Input Text
          </CardTitle>
          <CardDescription>Enter text to escape or unescape</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            placeholder='Enter text here...'
            rows={10}
            className="font-mono text-sm"
          />

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor="mode" className="text-sm font-medium">
                Escape Mode:
              </label>
              <Select
                id="mode"
                value={mode}
                options={[
                  { value: 'javascript', label: 'JavaScript/TypeScript' },
                  { value: 'json', label: 'JSON' },
                  { value: 'html', label: 'HTML' },
                  { value: 'xml', label: 'XML' },
                  { value: 'csv', label: 'CSV' },
                  { value: 'sql', label: 'SQL' },
                  { value: 'regex', label: 'Regex' },
                ]}
                onChange={(e: Event) => {
                  setMode((e.target as HTMLSelectElement).value as EscapeMode);
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEscape} variant="default" size="sm">
                Escape
              </Button>

              <Button onClick={handleUnescape} variant="default" size="sm">
                Unescape
              </Button>

              <Button onClick={handleSwap} variant="outline" size="sm" disabled={!output}>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Swap
              </Button>
            </div>

            <Button onClick={handleClear} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
          <CardDescription>
            {output ? `${output.length} characters` : 'Result will appear here'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={output}
            readOnly
            placeholder="Escaped/unescaped text will appear here..."
            rows={10}
            className="font-mono text-sm"
          />

          <Button onClick={handleCopy} disabled={!output} size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
