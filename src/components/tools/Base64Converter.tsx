'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Copy, Check, Trash2, ArrowLeftRight, Upload, FileText, X, Image as ImageIcon } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

type Mode = 'encode' | 'decode';
type Tab = 'text' | 'file';

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function isImageType(mime: string) {
  return mime.startsWith('image/');
}

export function Base64Converter() {
  const [tab, setTab] = useState<Tab>('text');

  // Text tab state
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('encode');
  const [error, setError] = useState('');

  // File tab state
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [copiedFile, setCopiedFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // ── Text mode ────────────────────────────────────────────────────────────────

  const handleConvert = (text: string, m: Mode) => {
    if (!text.trim()) { setOutput(''); setError(''); return; }
    try {
      if (m === 'encode') {
        const bytes = new TextEncoder().encode(text);
        const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
        setOutput(btoa(binary));
      } else {
        const binary = atob(text);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        setOutput(new TextDecoder().decode(bytes));
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
    }
  };

  const onInputChange = (val: string) => { setInput(val); handleConvert(val, mode); };
  const onModeChange = (m: Mode) => { setMode(m); handleConvert(input, m); };

  const handleSwap = () => {
    const nextMode: Mode = mode === 'encode' ? 'decode' : 'encode';
    setInput(output);
    setMode(nextMode);
    handleConvert(output, nextMode);
  };

  const handleClear = () => { setInput(''); setOutput(''); setError(''); };

  // ── File mode ────────────────────────────────────────────────────────────────

  const processFile = useCallback((f: File) => {
    setFile(f);
    setFileBase64('');
    setPreviewUrl('');
    setFileError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // dataUrl = "data:<mime>;base64,<b64>"
      const b64 = dataUrl.split(',')[1];
      setFileBase64(b64);
      if (isImageType(f.type)) setPreviewUrl(dataUrl);
    };
    reader.onerror = () => setFileError('Failed to read file');
    reader.readAsDataURL(f);
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

  const clearFile = () => {
    setFile(null);
    setFileBase64('');
    setPreviewUrl('');
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyFile = async () => {
    await copyToClipboard(fileBase64);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownload = () => {
    if (!file || !fileBase64) return;
    const link = document.createElement('a');
    link.href = `data:${file.type};base64,${fileBase64}`;
    link.download = file.name;
    link.click();
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
    setFileError('');
  };

  return (
    <div className="space-y-6">
      {/* Tab */}
      <div className="flex gap-2">
        <Button variant={tab === 'text' ? 'default' : 'outline'} onClick={() => switchTab('text')}>Text</Button>
        <Button variant={tab === 'file' ? 'default' : 'outline'} onClick={() => switchTab('file')}>File / Image</Button>
      </div>

      {tab === 'text' ? (
        <>
          {/* Mode */}
          <div className="flex gap-2">
            <Button variant={mode === 'encode' ? 'default' : 'outline'} onClick={() => onModeChange('encode')}>Encode</Button>
            <Button variant={mode === 'decode' ? 'default' : 'outline'} onClick={() => onModeChange('decode')}>Decode</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>{mode === 'encode' ? 'Enter text to encode' : 'Enter Base64 to decode'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => onInputChange((e.target as HTMLTextAreaElement).value)}
                placeholder={mode === 'encode' ? 'Type here...' : 'Paste Base64 here...'}
                rows={8}
                className="font-mono"
              />
            </CardContent>
          </Card>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
              <CardDescription>{output ? `${output.length} characters` : 'Result appears here automatically'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea value={output} readOnly placeholder="Output will appear here..." rows={8} className="font-mono" />
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(output)} disabled={!output} size="sm" variant={isCopied ? 'default' : 'outline'}>
                    {isCopied ? <><Check className="h-4 w-4 mr-2" />Copied!</> : <><Copy className="h-4 w-4 mr-2" />Copy</>}
                  </Button>
                  <Button onClick={handleSwap} disabled={!output} variant="outline" size="sm">
                    <ArrowLeftRight className="h-4 w-4 mr-2" />Swap
                  </Button>
                  <Button onClick={handleClear} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>File</CardTitle>
              <CardDescription>Any file type — images show a preview. Processed entirely in browser.</CardDescription>
            </CardHeader>
            <CardContent>
              {file ? (
                <div className="flex items-center gap-3 p-4 rounded-md border bg-muted">
                  {isImageType(file.type)
                    ? <ImageIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    : <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.type || 'unknown type'} · {formatBytes(file.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFile}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-md p-10 cursor-pointer transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drop file here or click to browse</p>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} aria-label="Select file to encode as Base64" />
                </div>
              )}
            </CardContent>
          </Card>

          {fileError && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              <strong>Error:</strong> {fileError}
            </div>
          )}

          {previewUrl && (
            <Card>
              <CardHeader><CardTitle>Image Preview</CardTitle></CardHeader>
              <CardContent>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="max-h-64 rounded-md object-contain mx-auto" />
              </CardContent>
            </Card>
          )}

          {fileBase64 && (
            <Card>
              <CardHeader>
                <CardTitle>Base64 Output</CardTitle>
                <CardDescription>{fileBase64.length.toLocaleString()} characters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea value={fileBase64} readOnly rows={8} className="font-mono text-xs" />
                  <div className="flex gap-2">
                    <Button onClick={handleCopyFile} size="sm" variant={copiedFile ? 'default' : 'outline'}>
                      {copiedFile ? <><Check className="h-4 w-4 mr-2" />Copied!</> : <><Copy className="h-4 w-4 mr-2" />Copy</>}
                    </Button>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      Download original
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
