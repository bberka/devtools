import { useState } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Copy, Check } from 'lucide-preact';
import md5 from 'blueimp-md5';

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>({
    MD5: '',
    'SHA-1': '',
    'SHA-256': '',
    'SHA-512': '',
  });
  const [copiedHash, setCopiedHash] = useState<HashAlgorithm | null>(null);

  const generateHash = async (algorithm: HashAlgorithm, text: string): Promise<string> => {
    if (algorithm === 'MD5') {
      return md5(text);
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleGenerateAll = async (text: string) => {
    if (!text) {
      setHashes({
        MD5: '',
        'SHA-1': '',
        'SHA-256': '',
        'SHA-512': '',
      });

      return;
    }

    const results: Record<HashAlgorithm, string> = {
      MD5: '',
      'SHA-1': '',
      'SHA-256': '',
      'SHA-512': '',
    };

    results['MD5'] = await generateHash('MD5', text);
    results['SHA-1'] = await generateHash('SHA-1', text);
    results['SHA-256'] = await generateHash('SHA-256', text);
    results['SHA-512'] = await generateHash('SHA-512', text);

    setHashes(results);
  };

  const handleCopy = async (algorithm: HashAlgorithm) => {
    await navigator.clipboard.writeText(hashes[algorithm]);
    setCopiedHash(algorithm);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onInput={(e) => {
              const newValue = (e.target as HTMLTextAreaElement).value;
              setInput(newValue);
              handleGenerateAll(newValue);
            }}
            placeholder="Enter text to hash..."
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Hash Results */}
      <div className="space-y-4">
        {(Object.keys(hashes) as HashAlgorithm[]).map((algorithm) => (
          <Card key={algorithm}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{algorithm}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(algorithm)}
                disabled={!hashes[algorithm]}
              >
                {copiedHash === algorithm ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
                {hashes[algorithm] || '-'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
