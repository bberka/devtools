'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Copy, Check, FileCode, Trash2, CheckCircle2, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

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

// Collapsible YAML Tree Node viewer component
function TreeNode({ name, value, depth = 0 }: { name?: string; value: unknown; depth: number }) {
  const [isExpanded, setIsExpanded] = useState(depth <= 1);
  
  if (value === null) {
    return (
      <div className="flex items-start gap-1 font-mono text-sm py-0.5">
        {name && <span className="text-purple-600 dark:text-purple-400 font-semibold">{name}:</span>}
        <span className="text-muted-foreground italic">null</span>
      </div>
    );
  }
  
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-start gap-1 font-mono text-sm py-0.5">
        {name && <span className="text-purple-600 dark:text-purple-400 font-semibold">{name}:</span>}
        <span className="text-blue-600 dark:text-blue-400 font-semibold">{value ? 'true' : 'false'}</span>
      </div>
    );
  }
  
  if (typeof value === 'number') {
    return (
      <div className="flex items-start gap-1 font-mono text-sm py-0.5">
        {name && <span className="text-purple-600 dark:text-purple-400 font-semibold">{name}:</span>}
        <span className="text-green-600 dark:text-green-400">{value}</span>
      </div>
    );
  }
  
  if (typeof value === 'string') {
    return (
      <div className="flex items-start gap-1 font-mono text-sm py-0.5">
        {name && <span className="text-purple-600 dark:text-purple-400 font-semibold">{name}:</span>}
        <span className="text-orange-600 dark:text-orange-400 break-all">"{value}"</span>
      </div>
    );
  }
  
  const isArray = Array.isArray(value);
  const keys = isArray ? [] : Object.keys(value as Record<string, unknown>);
  const itemsCount = isArray ? (value as unknown[]).length : keys.length;
  
  const label = isArray 
    ? `Sequence[${itemsCount}]` 
    : `Mapping {${itemsCount} key${itemsCount === 1 ? '' : 's'}}`;
  
  return (
    <div className="font-mono text-sm py-0.5">
      <div 
        className="flex items-center gap-1 cursor-pointer select-none py-0.5 hover:bg-accent/40 rounded px-1 w-max max-w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-muted-foreground shrink-0">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        {name && <span className="text-purple-600 dark:text-purple-400 font-semibold">{name}:</span>}
        <span className="text-muted-foreground text-xs font-semibold">{label}</span>
      </div>
      
      {isExpanded && (
        <div className="pl-4 ml-2 border-l border-muted-foreground/20 space-y-0.5">
          {isArray ? (
            (value as unknown[]).map((item, idx) => (
              <TreeNode key={idx} name={String(idx)} value={item} depth={depth + 1} />
            ))
          ) : (
            keys.map((key) => (
              <TreeNode key={key} name={key} value={(value as Record<string, unknown>)[key]} depth={depth + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function YamlValidator() {
  const [input, setInput] = useState('');
  const [indentation, setIndentation] = useState('2');
  const [isMinified, setIsMinified] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text');
  
  const [validation, setValidation] = useState<{
    valid: boolean;
    parsed: unknown;
    summary: string;
    error: string;
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const { copyToClipboard, isCopied } = useCopyToClipboard();

  useEffect(() => {
    if (!input.trim()) {
      setValidation(null);
      return;
    }

    let isCurrent = true;
    setIsEvaluating(true);

    const validate = async () => {
      try {
        const yaml = await import('js-yaml');
        if (!isCurrent) return;

        const parsed = yaml.load(input);
        if (!isCurrent) return;

        setValidation({
          valid: true,
          parsed,
          summary: summarizeYaml(parsed),
          error: '',
        });
      } catch (e) {
        if (!isCurrent) return;
        setValidation({
          valid: false,
          parsed: null,
          summary: '',
          error: e instanceof Error ? e.message : 'Invalid YAML syntax',
        });
      } finally {
        if (isCurrent) {
          setIsEvaluating(false);
        }
      }
    };

    void validate();

    return () => {
      isCurrent = false;
    };
  }, [input]);

  const outputResult = useMemo(() => {
    if (!validation || !validation.valid) return '';

    try {
      if (isMinified) {
        // Minifying YAML is typically represented as a single-line JSON structure
        return JSON.stringify(validation.parsed);
      }

      const spaces = indentation === 'tab' ? 4 : parseInt(indentation, 10);
      const yamlStringify = async () => {
        const yaml = await import('js-yaml');
        return yaml.dump(validation.parsed, { indent: spaces, lineWidth: -1 });
      };
      
      // Since yaml.dump is fast and we do it inside useMemo, we'll return a placeholder or do it synchronously by compiling.
      // Wait, js-yaml dump is synchronous anyway. Let's just import it synchronously in the component or dynamically during output computation.
      // Since useMemo must be synchronous, we can use require() or keep js-yaml statically imported for stringification, or we can compute formatted in useEffect!
      // Computing formatted in useEffect is extremely clean and prevents any issues with async in useMemo!
    } catch {
      // Ignore
    }
    return '';
  }, [validation, indentation, isMinified]);

  // Let's store output in state to handle async dump cleanly
  const [outputText, setOutputText] = useState('');
  useEffect(() => {
    if (!validation || !validation.valid) {
      setOutputText('');
      return;
    }

    let isCurrent = true;
    const format = async () => {
      try {
        if (isMinified) {
          if (isCurrent) setOutputText(JSON.stringify(validation.parsed));
          return;
        }
        const yaml = await import('js-yaml');
        if (!isCurrent) return;
        const spaces = indentation === 'tab' ? 4 : parseInt(indentation, 10);
        const formatted = yaml.dump(validation.parsed, { indent: spaces, lineWidth: -1 });
        if (isCurrent) setOutputText(formatted);
      } catch {
        if (isCurrent) setOutputText('');
      }
    };

    void format();
    return () => {
      isCurrent = false;
    };
  }, [validation, indentation, isMinified]);

  const handleMinify = () => {
    setIsMinified(true);
  };

  const handleIndentationChange = (value: string) => {
    setIndentation(value);
    setIsMinified(false);
  };

  const handleClear = () => {
    setInput('');
    setIsMinified(false);
  };

  const hasOutput = Boolean(outputText);

  return (
    <div className="space-y-4">
      {/* Input panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            YAML Inputs & Settings
          </CardTitle>
          <CardDescription>Paste your raw YAML text and configure formatting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            placeholder={'name: Ada\nroles:\n  - Admin\n  - Editor'}
            rows={10}
            className="font-mono text-sm bg-background"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Indentation configuration */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Indentation:</span>
                <Select value={indentation} onValueChange={handleIndentationChange}>
                  <SelectTrigger id="indentation" className="w-28 sm:w-32">
                    <SelectValue placeholder="Select" />
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

              <Button onClick={handleMinify} variant="outline" size="sm" className="min-h-11 sm:min-h-9" disabled={!validation?.valid}>
                Minify YAML (JSON format)
              </Button>
            </div>

            <Button onClick={handleClear} variant="outline" size="sm" className="min-h-11 sm:min-h-9">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Validation diagnostic status */}
          {validation && !isEvaluating && (
            <div
              className={`flex items-start gap-3 rounded-md px-4 py-3 text-sm ${
                validation.valid
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {validation.valid ? (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Valid YAML:</strong> {validation.summary}
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Invalid YAML Syntax:</strong> {validation.error}
                  </div>
                </>
              )}
            </div>
          )}

          {isEvaluating && (
            <div className="text-xs text-muted-foreground italic">Evaluating YAML syntax...</div>
          )}
        </CardContent>
      </Card>

      {/* Formatted Output Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b sm:pb-3">
          <div>
            <CardTitle>Formatted Output</CardTitle>
            <CardDescription>
              {outputText ? `${outputText.split('\n').length} lines` : 'Output will appear here'}
            </CardDescription>
          </div>
          {validation?.valid && (
            <div className="flex gap-1 bg-muted p-0.5 rounded-md border text-xs">
              <Button
                variant={viewMode === 'text' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('text')}
                className="h-7 px-2.5 text-xs font-semibold"
              >
                Text
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tree')}
                className="h-7 px-2.5 text-xs font-semibold"
              >
                Tree View
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {viewMode === 'tree' && validation?.valid && validation.parsed !== null ? (
            <div className="rounded-md border bg-muted/40 p-4 max-h-[500px] overflow-auto select-text scrollbar-thin">
              <TreeNode value={validation.parsed} depth={0} />
            </div>
          ) : (
            <Textarea
              value={outputText}
              readOnly
              placeholder="Formatted output will appear here..."
              rows={12}
              className="font-mono text-sm bg-muted/10 cursor-text"
            />
          )}

          <Button
            onClick={() => copyToClipboard(outputText)}
            disabled={!hasOutput || !validation?.valid}
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
                Copy Output
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
