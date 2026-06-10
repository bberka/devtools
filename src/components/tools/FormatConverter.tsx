'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Code, Trash2, ArrowRightLeft } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

type Format = 'json' | 'yaml' | 'xml' | 'csv';
type Delimiter = ',' | ';' | '\t' | '|';

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

function convertCsvToIntermediate(input: string, delimiter: Delimiter, useHeaders: boolean): unknown {
  const rows = parseCsv(input, delimiter);

  if (rows.length === 0) {
    return [];
  }

  if (!useHeaders) {
    return rows;
  }

  const [headers, ...dataRows] = rows;
  const normalizedHeaders = headers.map((header, index) => header.trim() || `column_${index + 1}`);
  const objects = dataRows.map((currentRow) =>
    Object.fromEntries(
      normalizedHeaders.map((header, index) => [header, currentRow[index] ?? ''])
    )
  );

  return objects;
}

function convertIntermediateToCsv(intermediate: unknown, delimiter: Delimiter, useHeaders: boolean): string {
  if (intermediate === null || intermediate === undefined) {
    return '';
  }

  let parsed: unknown = intermediate;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      // Keep it as is
    }
  }

  if (!Array.isArray(parsed)) {
    if (parsed && typeof parsed === 'object') {
      parsed = [parsed];
    } else {
      throw new Error('Data must be an array of objects or arrays to convert to CSV.');
    }
  }

  const arrayData = parsed as unknown[];
  if (arrayData.length === 0) {
    return '';
  }

  if (arrayData.every((item) => Array.isArray(item))) {
    return arrayData
      .map((row) => (row as unknown[]).map((cell) => escapeCsvValue(cell, delimiter)).join(delimiter))
      .join('\n');
  }

  if (!arrayData.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
    throw new Error('CSV conversion requires items to all be objects or all be arrays.');
  }

  const objects = arrayData as Array<Record<string, unknown>>;
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

const getPlaceholder = (format: Format) => {
  switch (format) {
    case 'json':
      return '[\n  {\n    "name": "John",\n    "age": 30,\n    "city": "New York"\n  }\n]';
    case 'yaml':
      return '- name: John\n  age: 30\n  city: New York';
    case 'xml':
      return '<root>\n  <name>John</name>\n  <age>30</age>\n  <city>New York</city>\n</root>';
    case 'csv':
      return 'name,age,city\nJohn,30,New York';
  }
};

export function FormatConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [inputFormat, setInputFormat] = useState<Format>('json');
  const [outputFormat, setOutputFormat] = useState<Format>('yaml');
  
  // Format-specific settings
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [useHeaders, setUseHeaders] = useState(true);
  const [jsonIndentation, setJsonIndentation] = useState('2');

  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const outputSummary = useMemo(() => {
    if (!output) {
      return 'Output will appear here';
    }
    const lines = output.split('\n').length;
    return `${lines} line${lines === 1 ? '' : 's'}`;
  }, [output]);

  const convert = async (
    text: string,
    fromFormat: Format,
    toFormat: Format,
    delim: Delimiter = delimiter,
    headersVal: boolean = useHeaders,
    indentVal: string = jsonIndentation
  ) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }

    if (fromFormat === toFormat) {
      setOutput(text);
      setError('');
      return;
    }

    try {
      const [yaml, xml] = await Promise.all([
        fromFormat === 'yaml' || toFormat === 'yaml' ? import('js-yaml') : Promise.resolve(null),
        fromFormat === 'xml' || toFormat === 'xml' ? import('xml-js') : Promise.resolve(null),
      ]);
      let intermediate: unknown;

      // Parse input to intermediate object
      switch (fromFormat) {
        case 'json':
          intermediate = JSON.parse(text);
          break;
        case 'yaml':
          intermediate = yaml?.load(text);
          break;
        case 'xml': {
          if (!xml) {
            throw new Error('XML converter failed to load');
          }
          const jsonStr = xml.xml2json(text, { compact: true, spaces: 2 });
          intermediate = JSON.parse(jsonStr);
          break;
        }
        case 'csv':
          intermediate = convertCsvToIntermediate(text, delim, headersVal);
          break;
      }

      // Convert intermediate to output format
      let result: string;
      switch (toFormat) {
        case 'json': {
          const spaces = indentVal === 'tab' ? '\t' : Number(indentVal);
          result = JSON.stringify(intermediate, null, spaces);
          break;
        }
        case 'yaml':
          result = yaml?.dump(intermediate, { indent: 2, lineWidth: -1 }) ?? '';
          break;
        case 'xml': {
          if (!xml) {
            throw new Error('XML converter failed to load');
          }
          const jsonForXml = JSON.stringify(intermediate);
          result = xml.json2xml(jsonForXml, { compact: true, spaces: 2 });
          break;
        }
        case 'csv':
          result = convertIntermediateToCsv(intermediate, delim, headersVal);
          break;
        default:
          result = '';
      }

      setOutput(result);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : `Invalid ${fromFormat.toUpperCase()}`);
      setOutput('');
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    void convert(text, inputFormat, outputFormat);
  };

  const handleInputFormatChange = (format: Format) => {
    setInputFormat(format);
    void convert(input, format, outputFormat);
  };

  const handleOutputFormatChange = (format: Format) => {
    setOutputFormat(format);
    void convert(input, inputFormat, format);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const swapFormats = () => {
    const tempInput = inputFormat;
    const tempOutput = outputFormat;
    setInputFormat(tempOutput);
    setOutputFormat(tempInput);

    const nextInput = output || getPlaceholder(tempOutput);
    setInput(nextInput);
    void convert(nextInput, tempOutput, tempInput);
  };

  const showOptions = inputFormat === 'csv' || outputFormat === 'csv' || outputFormat === 'json';

  return (
    <div className="space-y-4">
      {/* Format selector toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-muted-foreground">From:</span>
          <Select value={inputFormat} onValueChange={(value) => handleInputFormatChange(value as Format)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="From format" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={swapFormats} variant="outline" size="sm" className="min-h-11 self-stretch sm:min-h-9 sm:self-auto hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200">
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-muted-foreground">To:</span>
          <Select value={outputFormat} onValueChange={(value) => handleOutputFormatChange(value as Format)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="To format" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conditional Configuration Panel */}
      {showOptions && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4 bg-muted/40 rounded-lg border transition-all duration-300">
          {(inputFormat === 'csv' || outputFormat === 'csv') && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CSV Delimiter</label>
              <Select
                value={delimiter}
                onValueChange={(val) => {
                  const nextDelimiter = val as Delimiter;
                  setDelimiter(nextDelimiter);
                  void convert(input, inputFormat, outputFormat, nextDelimiter, useHeaders, jsonIndentation);
                }}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select delimiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {DELIMITER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {outputFormat === 'json' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">JSON Indentation</label>
              <Select
                value={jsonIndentation}
                onValueChange={(val) => {
                  setJsonIndentation(val);
                  void convert(input, inputFormat, outputFormat, delimiter, useHeaders, val);
                }}
              >
                <SelectTrigger className="w-full bg-background">
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

          {(inputFormat === 'csv' || outputFormat === 'csv') && (
            <div className="flex items-end pb-1.5">
              <Checkbox
                checked={useHeaders}
                onCheckedChange={(checked) => {
                  const nextUseHeaders = Boolean(checked);
                  setUseHeaders(nextUseHeaders);
                  void convert(input, inputFormat, outputFormat, delimiter, nextUseHeaders, jsonIndentation);
                }}
                label="Use header row / object keys"
              />
            </div>
          )}
        </div>
      )}

      {/* Main Panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5 text-primary" />
              Input {inputFormat.toUpperCase()}
            </CardTitle>
            <CardDescription>Paste your raw {inputFormat.toUpperCase()} data</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-4">
            <Textarea
              value={input}
              onChange={(e) => handleInputChange((e.target as HTMLTextAreaElement).value)}
              placeholder={getPlaceholder(inputFormat)}
              rows={14}
              className="flex-1 font-mono text-xs leading-relaxed resize-y focus-visible:ring-1 bg-background"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button onClick={handleClear} variant="outline" size="sm" className="min-h-11 sm:min-h-9 w-full sm:w-auto hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors duration-200">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-md text-xs leading-normal font-medium mt-2">
                <strong>Error parsing {inputFormat.toUpperCase()}:</strong> {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Output {outputFormat.toUpperCase()}</CardTitle>
            <CardDescription>{outputSummary}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-4">
            <Textarea
              value={output}
              readOnly
              placeholder={`Converted ${outputFormat.toUpperCase()} will appear here...`}
              rows={14}
              className="flex-1 font-mono text-xs leading-relaxed resize-y bg-muted/30 focus-visible:ring-0 cursor-text"
            />

            <Button
              onClick={() => copyToClipboard(output)}
              disabled={!output}
              size="sm"
              variant={isCopied ? "default" : "outline"}
              className="min-h-11 w-full sm:min-h-9 sm:w-auto transition-all duration-200 font-medium"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-primary-foreground" />
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
    </div>
  );
}
