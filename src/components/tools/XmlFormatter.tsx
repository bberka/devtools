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
import { Copy, Check, FileCode, Trash2 } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

export function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentation, setIndentation] = useState('2');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

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
            onChange={(e) => {
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
                value={indentation}
                onValueChange={(value) => {
                  setIndentation(value);
                  if (input.trim()) {
                    formatXml(input);
                  }
                }}
              >
                <SelectTrigger id="indentation" className="w-[140px]">
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

          <Button
            onClick={() => copyToClipboard(output)}
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
                Copy to Clipboard
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
