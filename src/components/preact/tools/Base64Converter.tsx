import { useState, useEffect } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Copy, Check, Trash2, ArrowLeftRight } from 'lucide-preact';
import { useCopyToClipboard } from '../hooks';

export function Base64Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  useEffect(() => {
    handleConvert();
  }, [input, mode]);

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (output) {
      await copyToClipboard(output);
    }
  };

  const handleSwap = () => {
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          onClick={() => setMode('encode')}
        >
          Encode
        </Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          onClick={() => setMode('decode')}
        >
          Decode
        </Button>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>
            {mode === 'encode' ? 'Enter text to encode' : 'Enter Base64 to decode'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
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

      {/* Output Section */}
      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
          <CardDescription>
            {output ? `${output.length} characters` : 'Result will appear here automatically'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={output}
              readOnly
              placeholder="Output will appear here..."
              rows={8}
              className="font-mono"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
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
                    Copy
                  </>
                )}
              </Button>
              <Button onClick={handleSwap} disabled={!output} variant="outline" size="sm">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Swap
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
