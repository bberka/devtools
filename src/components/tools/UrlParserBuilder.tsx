'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Check, Trash2, Plus, RefreshCw, ExternalLink, Link2, Code, ArrowRight } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

function parseURLString(input: string) {
  let protocol = '';
  let host = '';
  let path = '';
  let hash = '';
  const params: QueryParam[] = [];

  const working = input.trim();
  if (!working) {
    return { protocol, host, path, hash, params };
  }

  // Handle fake protocol if missing to utilize URL constructor
  let parsedUrl: URL | null = null;
  let hasFakeProtocol = false;
  let urlToParse = working;

  if (!/^[a-zA-Z]+:\/\//.test(working)) {
    urlToParse = 'https://' + working;
    hasFakeProtocol = true;
  }

  try {
    parsedUrl = new URL(urlToParse);
    protocol = hasFakeProtocol ? '' : parsedUrl.protocol;
    host = parsedUrl.host;
    path = parsedUrl.pathname;
    hash = parsedUrl.hash;
    
    let index = 0;
    parsedUrl.searchParams.forEach((value, key) => {
      params.push({
        id: `param-${index++}-${Date.now()}`,
        key,
        value,
        enabled: true,
      });
    });
  } catch (e) {
    // Fallback parser for partial or malformed paths
    const hashParts = working.split('#');
    hash = hashParts[1] ? '#' + hashParts[1] : '';
    const searchParts = hashParts[0].split('?');
    const search = searchParts[1] || '';

    const pathHost = searchParts[0];
    const protoMatch = pathHost.match(/^([a-zA-Z]+:\/\/)/);
    if (protoMatch) {
      protocol = protoMatch[1];
      const rest = pathHost.substring(protocol.length);
      const slashIdx = rest.indexOf('/');
      if (slashIdx !== -1) {
        host = rest.substring(0, slashIdx);
        path = rest.substring(slashIdx);
      } else {
        host = rest;
        path = '';
      }
    } else {
      protocol = '';
      const slashIdx = pathHost.indexOf('/');
      if (slashIdx !== -1) {
        host = pathHost.substring(0, slashIdx);
        path = pathHost.substring(slashIdx);
      } else {
        host = pathHost;
        path = '';
      }
    }

    if (search) {
      search.split('&').forEach((part, index) => {
        if (!part) return;
        const eqIdx = part.indexOf('=');
        if (eqIdx !== -1) {
          params.push({
            id: `param-${index}-${Date.now()}`,
            key: decodeURIComponent(part.substring(0, eqIdx)),
            value: decodeURIComponent(part.substring(eqIdx + 1)),
            enabled: true,
          });
        } else {
          params.push({
            id: `param-${index}-${Date.now()}`,
            key: decodeURIComponent(part),
            value: '',
            enabled: true,
          });
        }
      });
    }
  }

  return { protocol, host, path, hash, params };
}

export function UrlParserBuilder() {
  const [rawInput, setRawInput] = useState('');
  const [protocol, setProtocol] = useState('https:');
  const [host, setHost] = useState('');
  const [path, setPath] = useState('');
  const [hash, setHash] = useState('');
  const [params, setParams] = useState<QueryParam[]>([]);
  const [isUpdatingFromInput, setIsUpdatingFromInput] = useState(false);

  const copyResult = useCopyToClipboard();

  // Parse raw URL changes and sync components
  useEffect(() => {
    if (isUpdatingFromInput) return;

    const parsed = parseURLString(rawInput);
    setProtocol(parsed.protocol || 'https:');
    setHost(parsed.host);
    setPath(parsed.path || '/');
    setHash(parsed.hash);
    setParams(parsed.params);
  }, [rawInput, isUpdatingFromInput]);

  // Rebuild URL when component states change
  const rebuiltUrl = useMemo(() => {
    let result = '';
    if (protocol) {
      result += protocol.endsWith('//') ? protocol : (protocol.endsWith(':') ? `${protocol}//` : `${protocol}://`);
    } else if (host) {
      result += 'https://';
    }

    result += host;
    result += path;

    const activeParams = params.filter((p) => p.enabled && p.key.trim() !== '');
    if (activeParams.length > 0) {
      const searchParams = new URLSearchParams();
      activeParams.forEach((p) => {
        searchParams.append(p.key, p.value);
      });
      result += '?' + searchParams.toString();
    }

    if (hash) {
      result += hash.startsWith('#') ? hash : '#' + hash;
    }

    return result;
  }, [protocol, host, path, params, hash]);

  const handleRawInputChange = (value: string) => {
    setIsUpdatingFromInput(false);
    setRawInput(value);
  };

  const handleComponentChange = () => {
    setIsUpdatingFromInput(true);
  };

  // Synchronize the raw input field with rebuilt output when custom edits are performed
  useEffect(() => {
    if (isUpdatingFromInput) {
      setRawInput(rebuiltUrl);
    }
  }, [rebuiltUrl, isUpdatingFromInput]);

  const addParamRow = () => {
    handleComponentChange();
    setParams((prev) => [
      ...prev,
      {
        id: `param-${prev.length}-${Date.now()}`,
        key: '',
        value: '',
        enabled: true,
      },
    ]);
  };

  const updateParamRow = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    handleComponentChange();
    setParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const deleteParamRow = (id: string) => {
    handleComponentChange();
    setParams((prev) => prev.filter((p) => p.id !== id));
  };

  const urlEncodeField = (id: string, field: 'key' | 'value') => {
    const target = params.find((p) => p.id === id);
    if (!target) return;
    try {
      updateParamRow(id, field, encodeURIComponent(target[field]));
    } catch (e) {}
  };

  const urlDecodeField = (id: string, field: 'key' | 'value') => {
    const target = params.find((p) => p.id === id);
    if (!target) return;
    try {
      updateParamRow(id, field, decodeURIComponent(target[field]));
    } catch (e) {}
  };

  const handleClear = () => {
    setIsUpdatingFromInput(false);
    setRawInput('');
    setProtocol('https:');
    setHost('');
    setPath('/');
    setHash('');
    setParams([]);
  };

  return (
    <div className="space-y-6">
      {/* Raw Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Paste Source URL
          </CardTitle>
          <CardDescription>
            Input an absolute or relative URL to parse its path components and parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={rawInput}
            onChange={(e) => handleRawInputChange((e.target as HTMLInputElement).value)}
            placeholder="e.g., https://example.com/api/search?q=query&limit=10#results"
            className="font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={handleClear} variant="outline" size="sm" className="min-h-11 sm:min-h-9">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Path Components breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            URL Base Structure
          </CardTitle>
          <CardDescription className="text-xs">
            Edit the protocol, host, and path details directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Protocol
            </label>
            <Input
              value={protocol}
              onChange={(e) => {
                handleComponentChange();
                setProtocol((e.target as HTMLInputElement).value);
              }}
              placeholder="e.g., https:"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Host / Domain
            </label>
            <Input
              value={host}
              onChange={(e) => {
                handleComponentChange();
                setHost((e.target as HTMLInputElement).value);
              }}
              placeholder="e.g., example.com"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Path
            </label>
            <Input
              value={path}
              onChange={(e) => {
                handleComponentChange();
                setPath((e.target as HTMLInputElement).value);
              }}
              placeholder="e.g., /search"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Hash / Anchor
            </label>
            <Input
              value={hash}
              onChange={(e) => {
                handleComponentChange();
                setHash((e.target as HTMLInputElement).value);
              }}
              placeholder="e.g., #results"
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Query Parameters Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              Query Parameters ({params.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Configure, enable, or encode specific parameters.
            </CardDescription>
          </div>
          <Button onClick={addParamRow} size="sm" className="h-8 gap-1.5">
            <Plus className="h-4 w-4" />
            Add Param
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-4 border-t">
          {params.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground italic">
              No query parameters found. Click Add Param to create one.
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
              {params.map((param) => (
                <div key={param.id} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2 shrink-0">
                    <Checkbox
                      checked={param.enabled}
                      onCheckedChange={(checked) =>
                        updateParamRow(param.id, 'enabled', checked as boolean)
                      }
                      aria-label="Enable parameter"
                    />
                    <span className="text-xs text-muted-foreground sm:hidden font-medium">Active</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 flex-1 sm:grid-cols-2">
                    <div className="flex gap-1.5 items-center">
                      <Input
                        value={param.key}
                        onChange={(e) =>
                          updateParamRow(param.id, 'key', (e.target as HTMLInputElement).value)
                        }
                        placeholder="Key"
                        className="font-mono text-xs h-8 flex-1"
                        disabled={!param.enabled}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => urlEncodeField(param.id, 'key')}
                        className="h-7 w-7 text-muted-foreground"
                        title="URL Encode Key"
                        disabled={!param.enabled || !param.key}
                      >
                        <Code className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <Input
                        value={param.value}
                        onChange={(e) =>
                          updateParamRow(param.id, 'value', (e.target as HTMLInputElement).value)
                        }
                        placeholder="Value"
                        className="font-mono text-xs h-8 flex-1"
                        disabled={!param.enabled}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => urlEncodeField(param.id, 'value')}
                        className="h-7 w-7 text-muted-foreground"
                        title="URL Encode Value"
                        disabled={!param.enabled || !param.value}
                      >
                        <Code className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 justify-end mt-1 sm:mt-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => urlDecodeField(param.id, 'key')}
                      className="h-8 w-8 text-muted-foreground"
                      title="URL Decode Key/Value"
                      disabled={!param.enabled}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteParamRow(param.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      title="Delete Parameter"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Rebuilt URL */}
      {rebuiltUrl && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Rebuilt Output URL
            </CardTitle>
            <CardDescription>
              Dynamic, real-time URL reconstructed from base components and active parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-md bg-background border font-mono text-sm break-all select-all">
              {rebuiltUrl}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => copyResult.copyToClipboard(rebuiltUrl)}
                variant={copyResult.isCopied ? 'default' : 'outline'}
                size="sm"
                className="min-h-11 sm:min-h-9"
              >
                {copyResult.isCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied URL!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 sm:min-h-9"
                onClick={() => window.open(rebuiltUrl, '_blank')}
                disabled={!rebuiltUrl.startsWith('http')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
