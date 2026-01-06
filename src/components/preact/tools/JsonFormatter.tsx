import { useState } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { Select } from '@/components/preact/ui/select';
import { Copy, FileJson, Trash2 } from 'lucide-preact';

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentation, setIndentation] = useState('2');

  const formatJson = (text: string) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const spaces = indentation === 'tab' ? '\t' : parseInt(indentation);
      const formatted = JSON.stringify(parsed, null, spaces);
      setOutput(formatted);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const minifyJson = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
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
            <FileJson className="h-5 w-5" />
            Input JSON
          </CardTitle>
          <CardDescription>Paste your JSON here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onInput={(e) => {
              const newValue = (e.target as HTMLTextAreaElement).value;
              setInput(newValue);
              formatJson(newValue);
            }}
            placeholder='{"name": "John", "age": 30}'
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
                onChange={(e) => {
                  const newIndent = (e.target as HTMLSelectElement).value;
                  setIndentation(newIndent);
                  if (input.trim()) {
                    formatJson(input);
                  }
                }}
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="8">8 spaces</option>
                <option value="tab">Tab</option>
              </Select>
            </div>

            <Button onClick={minifyJson} variant="outline" size="sm">
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
            placeholder="Formatted JSON will appear here..."
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
