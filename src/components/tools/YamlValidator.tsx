'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, Copy, FileCode, Trash2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCopyToClipboard } from '@/hooks';
import yaml from 'js-yaml';

type ValidationResult = {
  valid: boolean;
  message: string;
  normalized: string;
  summary: string;
};

function summarizeYaml(value: unknown): string {
  if (Array.isArray(value)) {
    return `Top-level sequence with ${value.length.toLocaleString()} item${value.length === 1 ? '' : 's'}`;
  }

  if (value && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);
    return `Top-level mapping with ${keys.length.toLocaleString()} key${keys.length === 1 ? '' : 's'}`;
  }

  return `Top-level ${value === null ? 'null' : typeof value} value`;
}

export function YamlValidator() {
  const [input, setInput] = useState('');
  const copy = useCopyToClipboard();

  const result = useMemo<ValidationResult | null>(() => {
    if (!input.trim()) {
      return null;
    }

    try {
      const parsed = yaml.load(input) as unknown;

      return {
        valid: true,
        message: 'YAML is valid.',
        normalized: yaml.dump(parsed, { indent: 2, lineWidth: -1 }),
        summary: summarizeYaml(parsed),
      };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'Invalid YAML.',
        normalized: '',
        summary: '',
      };
    }
  }, [input]);

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            YAML Input
          </CardTitle>
          <CardDescription>Paste YAML to validate structure and syntax.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(event) => setInput((event.target as HTMLTextAreaElement).value)}
            placeholder={'name: Ada\nroles:\n  - Admin\n  - Editor'}
            rows={12}
            className="font-mono text-sm"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleClear} variant="outline" className="min-h-11 sm:min-h-10">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              onClick={() => copy.copyToClipboard(result?.normalized ?? '')}
              variant={copy.isCopied ? 'default' : 'outline'}
              disabled={!result?.valid || !result.normalized}
              className="min-h-11 sm:min-h-10"
            >
              <Copy className="mr-2 h-4 w-4" />
              {copy.isCopied ? 'Copied' : 'Copy normalized YAML'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Valid YAML</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-destructive">Invalid YAML</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {result.valid ? result.summary : 'Validation error details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`rounded-md px-4 py-3 text-sm ${
                result.valid
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {result.message}
            </div>

            {result.valid && (
              <Textarea
                value={result.normalized}
                readOnly
                rows={12}
                className="font-mono text-sm"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
