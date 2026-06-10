'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, FileJson, Trash2, CheckCircle2, AlertTriangle, Search, Info, ChevronRight, ChevronDown } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

// Helper function to query a JSON object using dot or bracket notation paths
function queryJson(obj: unknown, path: string): unknown {
  if (!path.trim()) return obj;
  
  let cleanPath = path.trim();
  if (cleanPath.startsWith('$.')) {
    cleanPath = cleanPath.substring(2);
  } else if (cleanPath.startsWith('$')) {
    cleanPath = cleanPath.substring(1);
  }
  
  if (!cleanPath) return obj;
  
  const tokens: string[] = [];
  const tokenRegex = /([^.\[\]]+)|\[['"]?([^'"]+)['"]?\]/g;
  let match;
  while ((match = tokenRegex.exec(cleanPath)) !== null) {
    tokens.push(match[1] || match[2]);
  }
  
  let current: unknown = obj;
  for (const token of tokens) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    if (Array.isArray(current)) {
      const idx = parseInt(token, 10);
      if (isNaN(idx)) {
        // Map key across array items if token is not an index
        current = current.map(item => {
          if (item && typeof item === 'object') {
            return (item as Record<string, unknown>)[token];
          }
          return undefined;
        });
      } else {
        current = current[idx];
      }
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[token];
    } else {
      return undefined;
    }
  }
  
  return current;
}

// Collapsible JSON Tree Node viewer component
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
    ? `Array[${itemsCount}]` 
    : `Object {${itemsCount} key${itemsCount === 1 ? '' : 's'}}`;
  
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

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [indentation, setIndentation] = useState('2');
  const [isMinified, setIsMinified] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // Reactive validation state computed from the input text
  const validation = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const parsed = JSON.parse(input);
      let summary = '';
      if (Array.isArray(parsed)) {
        summary = `Array with ${parsed.length.toLocaleString()} item${parsed.length === 1 ? '' : 's'}`;
      } else if (parsed && typeof parsed === 'object') {
        const keys = Object.keys(parsed);
        summary = `Object with ${keys.length.toLocaleString()} key${keys.length === 1 ? '' : 's'}`;
      } else {
        summary = `Primitive (${parsed === null ? 'null' : typeof parsed})`;
      }
      return { valid: true, parsed, summary, error: '' };
    } catch (e) {
      return {
        valid: false,
        parsed: null,
        summary: '',
        error: e instanceof Error ? e.message : 'Invalid JSON format',
      };
    }
  }, [input]);

  // Reactive output computation incorporating formatting and filter selectors
  const outputResult = useMemo(() => {
    if (!validation || !validation.valid) return { text: '', error: '', parsedResult: null };

    try {
      let result = validation.parsed;
      if (filterQuery.trim()) {
        result = queryJson(validation.parsed, filterQuery);
        if (result === undefined) {
          return { text: '', error: `No matching properties found for path: "${filterQuery}"`, parsedResult: null };
        }
      }

      if (isMinified) {
        return { text: JSON.stringify(result), error: '', parsedResult: result };
      }

      const spaces = indentation === 'tab' ? '\t' : parseInt(indentation, 10);
      return { text: JSON.stringify(result, null, spaces), error: '', parsedResult: result };
    } catch (e) {
      return {
        text: '',
        error: e instanceof Error ? e.message : 'Failed to process JSON output',
        parsedResult: null,
      };
    }
  }, [validation, filterQuery, indentation, isMinified]);

  const handleMinify = () => {
    setIsMinified(true);
  };

  const handleIndentationChange = (value: string) => {
    setIndentation(value);
    setIsMinified(false);
  };

  const handleClear = () => {
    setInput('');
    setFilterQuery('');
    setIsMinified(false);
  };

  const hasOutput = Boolean(outputResult.text);

  return (
    <div className="space-y-4">
      {/* Input panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            JSON Inputs & Settings
          </CardTitle>
          <CardDescription>Paste your raw JSON text and configure formatting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            placeholder='{"name": "Ada", "roles": ["Admin", "Editor"]}'
            rows={10}
            className="font-mono text-sm"
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
                Minify JSON
              </Button>
            </div>

            <Button onClick={handleClear} variant="outline" size="sm" className="min-h-11 sm:min-h-9">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Validation diagnostic status */}
          {validation && (
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
                    <strong>Valid JSON:</strong> {validation.summary}
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Invalid JSON Syntax:</strong> {validation.error}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query/Filter Selector Panel */}
      {validation?.valid && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" />
              Filter / Query Output
            </CardTitle>
            <CardDescription className="text-xs">
              Inspect nested fields using dot/bracket paths (e.g., <code>$.roles[0]</code> or <code>roles</code>). Leave empty for full JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={filterQuery}
              onChange={(e) => setFilterQuery((e.target as HTMLInputElement).value)}
              placeholder="e.g., roles or $.name"
              className="font-mono text-sm bg-background"
            />
          </CardContent>
        </Card>
      )}

      {/* Formatted Output Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b sm:pb-3">
          <div>
            <CardTitle>Formatted Output</CardTitle>
            <CardDescription>
              {outputResult.text ? `${outputResult.text.split('\n').length} lines` : 'Output will appear here'}
            </CardDescription>
          </div>
          {validation?.valid && !outputResult.error && (
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
          {outputResult.error ? (
            <div className="flex items-start gap-3 rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 px-4 py-3 text-sm">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div>{outputResult.error}</div>
            </div>
          ) : viewMode === 'tree' && outputResult.parsedResult !== null ? (
            <div className="rounded-md border bg-muted/40 p-4 max-h-[500px] overflow-auto select-text scrollbar-thin">
              <TreeNode value={outputResult.parsedResult} depth={0} />
            </div>
          ) : (
            <Textarea
              value={outputResult.text}
              readOnly
              placeholder="Formatted output will appear here..."
              rows={12}
              className="font-mono text-sm"
            />
          )}

          <Button
            onClick={() => copyToClipboard(outputResult.text)}
            disabled={!hasOutput || Boolean(outputResult.error)}
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
