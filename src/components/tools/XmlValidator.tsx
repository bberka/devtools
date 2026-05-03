'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, FileCode, Copy, Trash2 } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

interface ValidationResult {
  valid: boolean;
  message: string;
  normalized?: string;
}

export function XmlValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const copy = useCopyToClipboard();

  const validateXml = (text: string): ValidationResult => {
    if (!text.trim()) {
      return {
        valid: false,
        message: 'Please enter XML to validate',
      };
    }

    try {
      const parser = new DOMParser();
      const document = parser.parseFromString(text, 'application/xml');
      const parserError = document.querySelector('parsererror');

      if (parserError) {
        return {
          valid: false,
          message: parserError.textContent?.trim() || 'Invalid XML',
        };
      }

      const serializer = new XMLSerializer();
      const normalized = serializer.serializeToString(document);

      return {
        valid: true,
        message: 'XML is valid',
        normalized,
      };
    } catch (e) {
      return {
        valid: false,
        message: e instanceof Error ? e.message : 'Unknown validation error',
      };
    }
  };

  const handleValidate = () => {
    const validationResult = validateXml(input);
    setResult(validationResult);
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            XML Input
          </CardTitle>
          <CardDescription>Paste your XML to validate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => {
              setInput((e.target as HTMLTextAreaElement).value);
              setResult(null);
            }}
            placeholder='<?xml version="1.0"?>
<root>
  <item>value</item>
</root>'
            rows={12}
            className="font-mono text-sm"
          />

          <div className="flex gap-2">
            <Button onClick={handleValidate} disabled={!input.trim()}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button
              onClick={() => copy.copyToClipboard(result?.normalized ?? '')}
              variant={copy.isCopied ? 'default' : 'outline'}
              disabled={!result?.valid || !result.normalized}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copy.isCopied ? 'Copied' : 'Copy normalized XML'}
            </Button>

            <Button onClick={handleClear} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
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
                  <span className="text-green-500">Valid XML</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-destructive">Invalid XML</span>
                </>
              )}
            </CardTitle>
            <CardDescription>Validation result</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`px-4 py-3 rounded-md ${
                result.valid
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              <p className="font-medium">{result.message}</p>
            </div>
            {result.valid && result.normalized && (
              <Textarea
                value={result.normalized}
                readOnly
                rows={12}
                className="mt-4 font-mono text-sm"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
