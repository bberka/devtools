import { useState } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { Copy, Key, Trash2 } from 'lucide-preact';

interface JwtParts {
  header: string;
  payload: string;
  signature: string;
}

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export function JwtDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState('');

  const base64UrlDecode = (str: string): string => {
    // Convert base64url to base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' to make length a multiple of 4
    while (base64.length % 4) {
      base64 += '=';
    }

    try {
      // Pure JavaScript base64 decoding (works in both browser and SSR)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';

      for (let i = 0; i < base64.length; i += 4) {
        const encoded1 = chars.indexOf(base64[i]);
        const encoded2 = chars.indexOf(base64[i + 1]);
        const encoded3 = chars.indexOf(base64[i + 2]);
        const encoded4 = chars.indexOf(base64[i + 3]);

        const byte1 = (encoded1 << 2) | (encoded2 >> 4);
        const byte2 = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        const byte3 = ((encoded3 & 3) << 6) | encoded4;

        result += String.fromCharCode(byte1);
        if (encoded3 !== -1) result += String.fromCharCode(byte2);
        if (encoded4 !== -1) result += String.fromCharCode(byte3);
      }

      return decodeURIComponent(
        result.split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
    } catch (e) {
      throw new Error('Invalid base64url encoding');
    }
  };

  const decodeJwt = (token: string) => {
    if (!token.trim()) {
      setDecoded(null);
      setError('');
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
      }

      const [headerB64, payloadB64, signature] = parts;

      const headerJson = base64UrlDecode(headerB64);
      const payloadJson = base64UrlDecode(payloadB64);

      const header = JSON.parse(headerJson);
      const payload = JSON.parse(payloadJson);

      setDecoded({
        header,
        payload,
        signature,
      });
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JWT token');
      setDecoded(null);
    }
  };

  const handleCopyHeader = async () => {
    if (decoded) {
      await navigator.clipboard.writeText(JSON.stringify(decoded.header, null, 2));
    }
  };

  const handleCopyPayload = async () => {
    if (decoded) {
      await navigator.clipboard.writeText(JSON.stringify(decoded.payload, null, 2));
    }
  };

  const handleClear = () => {
    setInput('');
    setDecoded(null);
    setError('');
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            JWT Token
          </CardTitle>
          <CardDescription>Paste your JWT token here to decode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onInput={(e) => {
              const newValue = (e.target as HTMLTextAreaElement).value;
              setInput(newValue);
              decodeJwt(newValue);
            }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            rows={4}
            className="font-mono text-sm"
          />

          <Button onClick={handleClear} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {decoded && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Header</CardTitle>
              <CardDescription>Algorithm and token type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{JSON.stringify(decoded.header, null, 2)}</pre>
              </div>
              <Button onClick={handleCopyHeader} size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Header
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payload</CardTitle>
              <CardDescription>Claims and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{JSON.stringify(decoded.payload, null, 2)}</pre>
              </div>

              {/* Show common timestamp fields in human-readable format */}
              {(decoded.payload.iat || decoded.payload.exp || decoded.payload.nbf) && (
                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold">Timestamps:</h4>
                  {decoded.payload.iat && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">Issued At (iat):</span>
                      <span>{formatTimestamp(decoded.payload.iat as number)}</span>
                    </div>
                  )}
                  {decoded.payload.exp && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">Expires At (exp):</span>
                      <span>{formatTimestamp(decoded.payload.exp as number)}</span>
                      {decoded.payload.exp < Date.now() / 1000 && (
                        <span className="text-destructive font-semibold">(Expired)</span>
                      )}
                    </div>
                  )}
                  {decoded.payload.nbf && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">Not Before (nbf):</span>
                      <span>{formatTimestamp(decoded.payload.nbf as number)}</span>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={handleCopyPayload} size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Payload
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signature</CardTitle>
              <CardDescription>
                Verify signature with the secret key (not decoded, base64url encoded)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md font-mono text-sm break-all">
                {decoded.signature}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
