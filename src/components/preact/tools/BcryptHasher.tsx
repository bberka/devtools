import { useState } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Select } from '../ui/select';
import { Copy, Check, Shield, Loader2, CheckCircle, XCircle } from 'lucide-preact';
import { useCopyToClipboard, useActionButton } from '../hooks';
import bcrypt from 'bcryptjs';

type Mode = 'hash' | 'verify';
type Algorithm = 'bcrypt';

export function BcryptHasher() {
  const [mode, setMode] = useState<Mode>('hash');
  const [algorithm] = useState<Algorithm>('bcrypt');
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');
  const [rounds, setRounds] = useState(10);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { executeAction: executeHash, isLoading: isHashing } = useActionButton();
  const { executeAction: executeVerify, isLoading: isVerifying } = useActionButton();

  const generateHash = async () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter text to hash');
      setHash('');
      return;
    }

    try {
      const salt = await bcrypt.genSalt(rounds);
      const hashedPassword = await bcrypt.hash(input, salt);
      setHash(hashedPassword);
      setVerifyResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hashing failed');
      setHash('');
    }
  };

  const verifyHash = async () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter text to verify');
      setVerifyResult(null);
      return;
    }
    if (!hash.trim()) {
      setError('Please enter hash to verify against');
      setVerifyResult(null);
      return;
    }

    try {
      const isValid = await bcrypt.compare(input, hash);
      setVerifyResult(isValid);
    } catch (err) {
      setError('Invalid hash format or verification failed');
      setVerifyResult(null);
    }
  };

  const handleHash = async () => {
    await executeHash(generateHash);
  };

  const handleVerify = async () => {
    await executeVerify(verifyHash);
  };

  const handleCopy = async () => {
    await copyToClipboard(hash);
  };

  const handleClear = () => {
    setInput('');
    setHash('');
    setVerifyResult(null);
    setError('');
  };

  const isLoading = isHashing || isVerifying;

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={mode === 'hash' ? 'default' : 'outline'}
              onClick={() => {
                setMode('hash');
                setVerifyResult(null);
                setError('');
              }}
              className="flex-1 sm:flex-none"
            >
              <Shield className="h-4 w-4 mr-2" />
              Hash Password
            </Button>
            <Button
              variant={mode === 'verify' ? 'default' : 'outline'}
              onClick={() => {
                setMode('verify');
                setHash('');
                setError('');
              }}
              className="flex-1 sm:flex-none"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings (only in hash mode) */}
      {mode === 'hash' && (
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure hashing parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Algorithm: <span className="text-muted-foreground">Bcrypt</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Industry-standard password hashing with adaptive cost
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">
                Cost Factor (Rounds): {rounds}
              </label>
              <Slider
                value={rounds}
                onChange={(value) => setRounds(value)}
                min={4}
                max={15}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Higher rounds = more secure but slower. Recommended: 10-12
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'hash' ? 'Password' : 'Password to Verify'}
          </CardTitle>
          <CardDescription>
            {mode === 'hash'
              ? 'Enter the password to hash'
              : 'Enter the password to verify against the hash'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            value={input}
            onInput={(e) => setInput((e.target as HTMLInputElement).value)}
            placeholder="Enter password..."
            className="font-mono"
          />
        </CardContent>
      </Card>

      {/* Hash Input (verify mode) */}
      {mode === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle>Hash</CardTitle>
            <CardDescription>Enter the bcrypt hash to verify against</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={hash}
              onInput={(e) => setHash((e.target as HTMLTextAreaElement).value)}
              placeholder="$2a$10$..."
              rows={3}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {mode === 'hash' ? (
          <Button onClick={handleHash} disabled={isLoading || !input}>
            {isHashing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Hashing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Generate Hash
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleVerify} disabled={isLoading || !input || !hash}>
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Password
              </>
            )}
          </Button>
        )}
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Hash Output (hash mode) */}
      {mode === 'hash' && hash && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Hash Output</CardTitle>
              <CardDescription>{hash.length} characters</CardDescription>
            </div>
            <Button
              variant={isCopied ? 'default' : 'ghost'}
              size="icon"
              onClick={handleCopy}
              title={isCopied ? 'Copied!' : 'Copy to clipboard'}
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="w-full min-h-[60px] p-3 rounded-md bg-muted font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all border border-input">
              {hash}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Verification Result (verify mode) */}
      {mode === 'verify' && verifyResult !== null && (
        <Card
          className={
            verifyResult
              ? 'border-green-500/20 bg-green-500/5'
              : 'border-red-500/20 bg-red-500/5'
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div
                className={
                  verifyResult
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-red-600 dark:text-red-500'
                }
              >
                {verifyResult ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-medium text-base">
                  {verifyResult ? 'Password Matches!' : 'Password Does Not Match'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {verifyResult
                    ? 'The password matches the provided hash.'
                    : 'The password does not match the provided hash.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-500">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-sm space-y-2">
              <p className="font-medium">About Password Hashing</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  Bcrypt is a battle-tested password hashing algorithm designed to be slow
                </li>
                <li>Each hash includes a random salt automatically</li>
                <li>
                  The cost factor (rounds) determines how many iterations to perform (2^rounds)
                </li>
                <li>All hashing happens locally in your browser</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
