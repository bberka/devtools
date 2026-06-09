'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Copy, Check, Upload, FileText, X, File } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

const EMPTY_HASHES: Record<HashAlgorithm, string> = {
  MD5: '', 'SHA-1': '', 'SHA-256': '', 'SHA-384': '', 'SHA-512': '',
};

async function computeHash(algorithm: HashAlgorithm, data: ArrayBuffer | string): Promise<string> {
  if (algorithm === 'MD5') {
    const { default: md5 } = await import('blueimp-md5');
    if (typeof data === 'string') return md5(data);
    const bytes = new Uint8Array(data);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return md5(binary);
  }
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data).buffer : data;
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function computeAll(data: ArrayBuffer | string): Promise<Record<HashAlgorithm, string>> {
  const results = { ...EMPTY_HASHES };
  await Promise.all(
    ALGORITHMS.map(async (alg) => {
      results[alg] = await computeHash(alg, data);
    })
  );
  return results;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function HashGenerator() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>(EMPTY_HASHES);
  const [copiedHash, setCopiedHash] = useState<HashAlgorithm | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { copyToClipboard } = useCopyToClipboard();

  const handleCopy = async (algorithm: HashAlgorithm) => {
    await copyToClipboard(hashes[algorithm]);
    setCopiedHash(algorithm);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleTextChange = async (text: string) => {
    setInput(text);
    if (!text) { setHashes(EMPTY_HASHES); return; }
    const results = await computeAll(text);
    setHashes(results);
  };

  const processFile = useCallback(async (f: File) => {
    setFile(f);
    setHashes(EMPTY_HASHES);
    setError('');
    setLoading(true);
    try {
      const buffer = await f.arrayBuffer();
      const results = await computeAll(buffer);
      setHashes(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const clearFile = () => {
    setFile(null);
    setHashes(EMPTY_HASHES);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const switchMode = (m: 'text' | 'file') => {
    setMode(m);
    setHashes(EMPTY_HASHES);
    setError('');
    if (m === 'text') { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
    else { setInput(''); }
  };

  const hasAnyHash = ALGORITHMS.some((a) => hashes[a]);

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(val) => switchMode(val as 'text' | 'file')}>
        <TabsList className="grid grid-cols-2 max-w-[400px]">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2">
            <File className="h-4 w-4" />
            File
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'text' ? (
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Hashes update in real time</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => handleTextChange((e.target as HTMLTextAreaElement).value)}
              placeholder="Enter text to hash..."
              rows={6}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>File</CardTitle>
            <CardDescription>Drop a file or click to select — hashed entirely in browser</CardDescription>
          </CardHeader>
          <CardContent>
            {file ? (
              <div className="flex items-center gap-3 p-4 rounded-md border bg-muted">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-md p-10 cursor-pointer transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drop file here or click to browse</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} aria-label="Select file to hash" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-muted-foreground px-1">Computing hashes...</div>
      )}

      <div className="space-y-3">
        {ALGORITHMS.map((algorithm) => (
          <Card key={algorithm}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{algorithm}</CardTitle>
              <Button
                variant={copiedHash === algorithm ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handleCopy(algorithm)}
                disabled={!hashes[algorithm]}
              >
                {copiedHash === algorithm ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
                {hashes[algorithm] || (hasAnyHash ? '-' : <span className="text-muted-foreground">—</span>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
