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
import { Copy, Check, Code, Trash2, ArrowRight } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

type Format = 'json' | 'yaml' | 'xml';

export function JsonYamlXmlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [inputFormat, setInputFormat] = useState<Format>('json');
  const [outputFormat, setOutputFormat] = useState<Format>('yaml');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const convert = async (text: string, fromFormat: Format, toFormat: Format) => {
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
      }

      // Convert intermediate to output format
      let result: string;
      switch (toFormat) {
        case 'json':
          result = JSON.stringify(intermediate, null, 2);
          break;
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
    convert(text, inputFormat, outputFormat);
  };

  const handleInputFormatChange = (format: Format) => {
    setInputFormat(format);
    convert(input, format, outputFormat);
  };

  const handleOutputFormatChange = (format: Format) => {
    setOutputFormat(format);
    convert(input, inputFormat, format);
  };


  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const swapFormats = () => {
    const temp = inputFormat;
    setInputFormat(outputFormat);
    setOutputFormat(temp);

    // If we have output, use it as the new input
    if (output) {
      setInput(output);
      convert(output, outputFormat, temp);
    }
  };

  const getPlaceholder = (format: Format) => {
    switch (format) {
      case 'json':
        return '{"name": "John", "age": 30}';
      case 'yaml':
        return 'name: John\nage: 30';
      case 'xml':
        return '<root>\n  <name>John</name>\n  <age>30</age>\n</root>';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From:</label>
          <Select value={inputFormat} onValueChange={(value) => handleInputFormatChange(value as Format)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="From format" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={swapFormats} variant="outline" size="sm">
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To:</label>
          <Select
            value={outputFormat}
            onValueChange={(value) => handleOutputFormatChange(value as Format)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="To format" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
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
          <CardDescription>Paste your {inputFormat.toUpperCase()} here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => handleInputChange((e.target as HTMLTextAreaElement).value)}
            placeholder={getPlaceholder(inputFormat)}
            rows={12}
            className="font-mono text-sm"
          />

          <div className="flex items-center gap-4">
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
