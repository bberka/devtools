import { useState } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { Select } from '@/components/preact/ui/select';
import { Copy, FileCode, Trash2 } from 'lucide-preact';

export function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentation, setIndentation] = useState('2');

  const formatXml = (text: string) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const indent = indentation === 'tab' ? '\t' : ' '.repeat(parseInt(indentation));
      let formatted = '';
      let level = 0;

      // Normalize whitespace between tags
      const normalized = text.replace(/>\s+</g, '><');

      // Split on tag boundaries
      const tokens = normalized.split(/(<[^>]+>)/g).filter(t => t.trim());

      for (const token of tokens) {
        if (!token.trim()) continue;

        if (token.startsWith('</')) {
          // Closing tag
          level = Math.max(0, level - 1);
          formatted += indent.repeat(level) + token + '\n';
        } else if (token.startsWith('<?') || token.startsWith('<!')) {
          // XML declaration or comment
          formatted += indent.repeat(level) + token + '\n';
        } else if (token.startsWith('<')) {
          // Opening tag or self-closing
          formatted += indent.repeat(level) + token + '\n';
          if (!token.endsWith('/>') && !token.includes('</')) {
            level++;
          }
        } else {
          // Text content
          formatted += indent.repeat(level) + token.trim() + '\n';
        }
      }

      setOutput(formatted.trim());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid XML');
      setOutput('');
    }
  };

  const minifyXml = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const minified = input.replace(/>\s+</g, '><').trim();
      setOutput(minified);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid XML');
      setOutput('');
    }
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
            <FileCode className="h-5 w-5" />
            Input XML
          </CardTitle>
          <CardDescription>Paste your XML here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onInput={(e) => {
              const newValue = (e.target as HTMLTextAreaElement).value;
              setInput(newValue);
              formatXml(newValue);
            }}
            placeholder='<root><item>value</item></root>'
            rows={10}
            className="font-mono text-sm"
          />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="indentation" className="text-sm font-medium">
                Indentation:
              </label>
              <Select
                id="indentation"
                value={indentation}
                options={[
                  { value: '2', label: '2 spaces' },
                  { value: '4', label: '4 spaces' },
                  { value: '8', label: '8 spaces' },
                  { value: 'tab', label: 'Tab' },
                ]}
                onChange={(e: Event) => {
                  const newIndent = (e.target as HTMLSelectElement).value;
                  setIndentation(newIndent);
                  if (input.trim()) {
                    formatXml(input);
                  }
                }}
              />
            </div>

            <Button onClick={minifyXml} variant="outline" size="sm">
              Minify
            </Button>

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
          <CardTitle>Formatted Output</CardTitle>
          <CardDescription>
            {output ? `${output.split('\n').length} lines` : 'Output will appear here'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={output}
            readOnly
            placeholder="Formatted XML will appear here..."
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
