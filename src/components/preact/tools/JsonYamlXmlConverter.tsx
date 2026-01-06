import { useState } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { Select } from '@/components/preact/ui/select';
import { Copy, Code, Trash2, ArrowRight } from 'lucide-preact';
import * as yaml from 'js-yaml';
import { json2xml, xml2json } from 'xml-js';

type Format = 'json' | 'yaml' | 'xml';

export function JsonYamlXmlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [inputFormat, setInputFormat] = useState<Format>('json');
  const [outputFormat, setOutputFormat] = useState<Format>('yaml');

  const convert = (text: string, fromFormat: Format, toFormat: Format) => {
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
      let intermediate: any;

      // Parse input to intermediate object
      switch (fromFormat) {
        case 'json':
          intermediate = JSON.parse(text);
          break;
        case 'yaml':
          intermediate = yaml.load(text);
          break;
        case 'xml':
          const jsonStr = xml2json(text, { compact: true, spaces: 2 });
          intermediate = JSON.parse(jsonStr);
          break;
      }

      // Convert intermediate to output format
      let result: string;
      switch (toFormat) {
        case 'json':
          result = JSON.stringify(intermediate, null, 2);
          break;
        case 'yaml':
          result = yaml.dump(intermediate, { indent: 2, lineWidth: -1 });
          break;
        case 'xml':
          const jsonForXml = JSON.stringify(intermediate);
          result = json2xml(jsonForXml, { compact: true, spaces: 2 });
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
          <Select
            value={inputFormat}
            onChange={(e) => handleInputFormatChange((e.target as HTMLSelectElement).value as Format)}
          >
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="xml">XML</option>
          </Select>
        </div>

        <Button onClick={swapFormats} variant="outline" size="sm">
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To:</label>
          <Select
            value={outputFormat}
            onChange={(e) => handleOutputFormatChange((e.target as HTMLSelectElement).value as Format)}
          >
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="xml">XML</option>
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
            onInput={(e) => handleInputChange((e.target as HTMLTextAreaElement).value)}
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

          <Button onClick={handleCopy} disabled={!output} size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
