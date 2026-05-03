'use client';

import { useState } from 'react';
import { ArrowRightLeft, Check, Code, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCopyToClipboard } from '@/hooks';

type Format = 'json' | 'yaml';

function getPlaceholder(format: Format): string {
  if (format === 'json') {
    return '{\n  "name": "Ada",\n  "role": "Admin",\n  "active": true\n}';
  }

  return 'name: Ada\nrole: Admin\nactive: true';
}

export function YamlJsonConverter() {
  const [inputFormat, setInputFormat] = useState<Format>('yaml');
  const [outputFormat, setOutputFormat] = useState<Format>('json');
  const [input, setInput] = useState(getPlaceholder('yaml'));
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [jsonIndentation, setJsonIndentation] = useState('2');
  const copy = useCopyToClipboard();

  const convert = async (
    nextInput: string,
    nextInputFormat = inputFormat,
    nextOutputFormat = outputFormat,
    nextIndentation = jsonIndentation
  ) => {
    if (!nextInput.trim()) {
      setOutput('');
      setError('');
      return;
    }

    if (nextInputFormat === nextOutputFormat) {
      setOutput(nextInput);
      setError('');
      return;
    }

    try {
      const yaml = await import('js-yaml');
      let result = '';

      if (nextInputFormat === 'yaml' && nextOutputFormat === 'json') {
        const parsed = yaml.load(nextInput);
        const spaces = nextIndentation === 'tab' ? '\t' : Number(nextIndentation);
        result = JSON.stringify(parsed, null, spaces);
      } else {
        const parsed = JSON.parse(nextInput);
        result = yaml.dump(parsed, { indent: 2, lineWidth: -1 });
      }

      setOutput(result);
      setError('');
    } catch (conversionError) {
      setOutput('');
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : `Invalid ${nextInputFormat.toUpperCase()}`
      );
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    void convert(value);
  };

  const handleSwap = () => {
    const nextInputFormat = outputFormat;
    const nextOutputFormat = inputFormat;
    const nextInput = output || getPlaceholder(nextInputFormat);

    setInputFormat(nextInputFormat);
    setOutputFormat(nextOutputFormat);
    setInput(nextInput);
    void convert(nextInput, nextInputFormat, nextOutputFormat);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-medium">From:</label>
          <Select
            value={inputFormat}
            onValueChange={(value) => {
              const nextInputFormat = value as Format;
              const nextOutputFormat = nextInputFormat === 'json' ? 'yaml' : 'json';
              const nextInput = getPlaceholder(nextInputFormat);

              setInputFormat(nextInputFormat);
              setOutputFormat(nextOutputFormat);
              setInput(nextInput);
              void convert(nextInput, nextInputFormat, nextOutputFormat);
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="From format" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSwap} variant="outline" size="sm" className="min-h-11 self-stretch sm:min-h-9 sm:self-auto">
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-medium">To:</label>
          <Select value={outputFormat} disabled>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="To format" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Input {inputFormat.toUpperCase()}
          </CardTitle>
          <CardDescription>
            Convert between YAML and JSON with a focused workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {outputFormat === 'json' && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-medium">JSON indentation:</label>
              <Select
                value={jsonIndentation}
                onValueChange={(value) => {
                  setJsonIndentation(value);
                  void convert(input, inputFormat, outputFormat, value);
                }}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
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
          )}

          <Textarea
            value={input}
            onChange={(event) => handleInputChange((event.target as HTMLTextAreaElement).value)}
            placeholder={getPlaceholder(inputFormat)}
            rows={12}
            className="font-mono text-sm"
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button onClick={handleClear} variant="outline" size="sm" className="min-h-11 sm:min-h-9">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <strong>Error:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output {outputFormat.toUpperCase()}</CardTitle>
          <CardDescription>
            {output ? `Converted to ${outputFormat.toUpperCase()}` : 'Output will appear here'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={output}
            readOnly
            placeholder={`Converted ${outputFormat.toUpperCase()} will appear here...`}
            rows={12}
            className="font-mono text-sm"
          />

          <Button
            onClick={() => copy.copyToClipboard(output)}
            disabled={!output}
            size="sm"
            variant={copy.isCopied ? 'default' : 'outline'}
            className="min-h-11 w-full sm:min-h-9 sm:w-auto"
          >
            {copy.isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
