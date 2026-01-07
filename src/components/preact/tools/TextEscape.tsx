import { useState, useEffect } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { Select } from '@/components/preact/ui/select';
import { Copy, Quote, Trash2, ArrowLeftRight, Check } from 'lucide-preact';
import { useCopyToClipboard } from '../hooks';

type EscapeMode = 'javascript' | 'json' | 'html' | 'xml' | 'csv' | 'sql' | 'regex';

export function TextEscape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<EscapeMode>('javascript');
  const [direction, setDirection] = useState<'escape' | 'unescape'>('escape');
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

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

  useEffect(() => {
    handleConvert();
  }, [input, mode, direction]);

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (direction === 'escape') {
        const escaped = escapeText(input, mode);
        setOutput(escaped);
      } else {
        const unescaped = unescapeText(input, mode);
        setOutput(unescaped);
      }
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to convert text');
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
      await copyToClipboard(output);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={direction === 'escape' ? 'default' : 'outline'}
          onClick={() => setDirection('escape')}
        >
          Escape
        </Button>
        <Button
          variant={direction === 'unescape' ? 'default' : 'outline'}
          onClick={() => setDirection('unescape')}
        >
          Unescape
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            Input
          </CardTitle>
          <CardDescription>
            {direction === 'escape' ? 'Enter text to escape' : 'Enter escaped text to unescape'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="mode" className="text-sm font-medium">
              Escape Mode
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

          <Textarea
            value={input}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            placeholder={direction === 'escape' ? 'Enter text here...' : 'Enter escaped text here...'}
            rows={8}
            className="font-mono"
          />
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
          <CardDescription>
            {output ? `${output.length} characters` : 'Result will appear here automatically'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <pre className="w-full min-h-[200px] p-3 rounded-md bg-muted font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all border border-input">
              {output || 'Output will appear here...'}
            </pre>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                disabled={!output}
                size="sm"
                variant={isCopied ? "default" : "outline"}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button onClick={handleSwap} disabled={!output} variant="outline" size="sm">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Swap
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
