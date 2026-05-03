'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, FileJson, Trash2 } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentation, setIndentation] = useState('2');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

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
            onChange={(e) => {
              const newValue = (e.target as HTMLTextAreaElement).value;
              setInput(newValue);
              formatJson(newValue);
            }}
            placeholder='{"name": "John", "age": 30}'
            rows={10}
            className="font-mono text-sm"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="indentation" className="text-sm font-medium">
                Indentation:
              </label>
              <Select
                value={indentation}
                onValueChange={(value) => {
                  setIndentation(value);
                  if (input.trim()) {
                    formatJson(input);
                  }
                }}
              >
                <SelectTrigger id="indentation" className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Indentation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="8">8 spaces</SelectItem>
                    <SelectItem value="tab">Tab</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={minifyJson} variant="outline" size="sm" className="min-h-11 sm:min-h-9">
              Minify
            </Button>

            <Button onClick={handleClear} variant="outline" size="sm" className="min-h-11 sm:min-h-9">
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

          <Button
            onClick={() => copyToClipboard(output)}
            disabled={!output}
            size="sm"
            variant={isCopied ? "default" : "outline"}
            className="min-h-11 w-full sm:min-h-9 sm:w-auto"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
