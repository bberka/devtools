'use client';

import { useMemo, useState } from 'react';
import { ArrowRightLeft, Check, Copy, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

type Format = 'csv' | 'json';
type Delimiter = ',' | ';' | '\t' | '|';

const FORMAT_OPTIONS: Array<{ value: Format; label: string }> = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

const DELIMITER_OPTIONS: Array<{ value: Delimiter; label: string }> = [
  { value: ',', label: 'Comma (,)' },
  { value: ';', label: 'Semicolon (;)' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe (|)' },
];

function escapeCsvValue(value: unknown, delimiter: Delimiter): string {
  const text = value == null ? '' : String(value);
  const needsQuotes =
    text.includes('"') || text.includes('\n') || text.includes('\r') || text.includes(delimiter);

  if (!needsQuotes) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function parseCsv(input: string, delimiter: Delimiter): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let insideQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const nextCharacter = input[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        value += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (!insideQuotes && character === delimiter) {
      row.push(value);
      value = '';
      continue;
    }

    if (!insideQuotes && (character === '\n' || character === '\r')) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1;
      }

      row.push(value);
      rows.push(row);
      row = [];
      value = '';
      continue;
    }

    value += character;
  }

  if (insideQuotes) {
    throw new Error('CSV contains an unclosed quoted field.');
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter((currentRow) => currentRow.length > 1 || currentRow[0] !== '');
}

function convertCsvToJson(
  input: string,
  delimiter: Delimiter,
  useHeaders: boolean,
  indentation: string
): string {
  const rows = parseCsv(input, delimiter);

  if (rows.length === 0) {
    return '';
  }

  const spaces = indentation === 'tab' ? '\t' : Number(indentation);

  if (!useHeaders) {
    return JSON.stringify(rows, null, spaces);
  }

  const [headers, ...dataRows] = rows;
  const normalizedHeaders = headers.map((header, index) => header.trim() || `column_${index + 1}`);
  const objects = dataRows.map((currentRow) =>
    Object.fromEntries(
      normalizedHeaders.map((header, index) => [header, currentRow[index] ?? ''])
    )
  );

  return JSON.stringify(objects, null, spaces);
}

function convertJsonToCsv(input: string, delimiter: Delimiter, useHeaders: boolean): string {
  const parsed = JSON.parse(input) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('JSON input must be an array of objects or arrays.');
  }

  if (parsed.length === 0) {
    return '';
  }

  if (parsed.every((item) => Array.isArray(item))) {
    return parsed
      .map((row) => (row as unknown[]).map((cell) => escapeCsvValue(cell, delimiter)).join(delimiter))
      .join('\n');
  }

  if (!parsed.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
    throw new Error('JSON array items must all be objects or all be arrays.');
  }

  const objects = parsed as Array<Record<string, unknown>>;
  const headers = Array.from(new Set(objects.flatMap((item) => Object.keys(item))));
  const lines: string[] = [];

  if (useHeaders) {
    lines.push(headers.map((header) => escapeCsvValue(header, delimiter)).join(delimiter));
  }

  objects.forEach((item) => {
    lines.push(
      headers.map((header) => escapeCsvValue(item[header] ?? '', delimiter)).join(delimiter)
    );
  });

  return lines.join('\n');
}

function getPlaceholder(format: Format): string {
  if (format === 'csv') {
    return 'name,email,role\nAda,ada@example.com,Admin\nLinus,linus@example.com,Editor';
  }

  return '[\n  {\n    "name": "Ada",\n    "email": "ada@example.com",\n    "role": "Admin"\n  }\n]';
}

export function CsvJsonConverter() {
  const [inputFormat, setInputFormat] = useState<Format>('csv');
  const [outputFormat, setOutputFormat] = useState<Format>('json');
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [useHeaders, setUseHeaders] = useState(true);
  const [indentation, setIndentation] = useState('2');
  const [input, setInput] = useState(getPlaceholder('csv'));
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const copy = useCopyToClipboard();

  const outputSummary = useMemo(() => {
    if (!output) {
      return 'Output will appear here';
    }

    return `${output.split('\n').length} lines`;
  }, [output]);

  const runConvert = (
    nextInput: string,
    nextInputFormat: Format,
    nextOutputFormat: Format,
    nextDelimiter: Delimiter,
    nextUseHeaders: boolean,
    nextIndentation: string
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
      const result =
        nextInputFormat === 'csv'
          ? convertCsvToJson(nextInput, nextDelimiter, nextUseHeaders, nextIndentation)
          : convertJsonToCsv(nextInput, nextDelimiter, nextUseHeaders);

      setOutput(result);
      setError('');
    } catch (conversionError) {
      setOutput('');
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : `Unable to convert ${nextInputFormat.toUpperCase()}.`
      );
    }
  };

  const convert = (nextInput: string) => {
    runConvert(nextInput, inputFormat, outputFormat, delimiter, useHeaders, indentation);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    convert(value);
  };

  const handleSwap = () => {
    const nextInputFormat = outputFormat;
    const nextOutputFormat = inputFormat;
    const nextInput = output || getPlaceholder(nextInputFormat);

    setInputFormat(nextInputFormat);
    setOutputFormat(nextOutputFormat);
    setInput(nextInput);
    runConvert(
      nextInput,
      nextInputFormat,
      nextOutputFormat,
      delimiter,
      useHeaders,
      indentation
    );
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
              const nextOutputFormat = nextInputFormat === 'csv' ? 'json' : 'csv';
              const nextInput = getPlaceholder(nextInputFormat);

              setInputFormat(nextInputFormat);
              setOutputFormat(nextOutputFormat);
              setInput(nextInput);
              runConvert(
                nextInput,
                nextInputFormat,
                nextOutputFormat,
                delimiter,
                useHeaders,
                indentation
              );
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="From format" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {FORMAT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
                {FORMAT_OPTIONS.filter((option) => option.value !== inputFormat).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Input {inputFormat.toUpperCase()}
          </CardTitle>
          <CardDescription>
            Paste your {inputFormat.toUpperCase()} data and convert it instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Delimiter</label>
              <Select
                value={delimiter}
                onValueChange={(value) => {
                  const nextDelimiter = value as Delimiter;
                  setDelimiter(nextDelimiter);
                  runConvert(
                    input,
                    inputFormat,
                    outputFormat,
                    nextDelimiter,
                    useHeaders,
                    indentation
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delimiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {DELIMITER_OPTIONS.map((option) => (
                      <SelectItem key={option.label} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">JSON indentation</label>
              <Select
                value={indentation}
                onValueChange={(value) => {
                  setIndentation(value);
                  runConvert(input, inputFormat, outputFormat, delimiter, useHeaders, value);
                }}
              >
                <SelectTrigger>
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

            <div className="flex items-end">
              <Checkbox
                checked={useHeaders}
                onCheckedChange={(checked) => {
                  const nextUseHeaders = Boolean(checked);
                  setUseHeaders(nextUseHeaders);
                  runConvert(
                    input,
                    inputFormat,
                    outputFormat,
                    delimiter,
                    nextUseHeaders,
                    indentation
                  );
                }}
                label="Use header row / object keys"
              />
            </div>
          </div>

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
          <CardDescription>{outputSummary}</CardDescription>
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
