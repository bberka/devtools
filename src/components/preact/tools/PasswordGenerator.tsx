import { useState } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Copy, Check } from 'lucide-preact';

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [special, setSpecial] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';
    if (special) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      setPassword('Please select at least one character set');
      return;
    }

    if (excludeAmbiguous) {
      charset = charset.replace(/[0Ol1iI]/g, '');
    }

    let result = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }

    setPassword(result);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    if (!password || password.includes('Please select')) return '';

    const charsets = [uppercase, lowercase, numbers, special].filter(Boolean).length;
    const score = length * charsets;

    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Length: {length}</label>
            <Slider
              value={length}
              onChange={(e) => {
                setLength(e);
                generatePassword();
              }}
              min={4}
              max={64}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Character Sets</p>
            <Checkbox
              checked={uppercase}
              onChange={(e) => {
                setUppercase(e);
                generatePassword();
              }}
              label="Uppercase (A-Z)"
            />
            <Checkbox
              checked={lowercase}
              onChange={(e) => {
                setLowercase(e);
                generatePassword();
              }}
              label="Lowercase (a-z)"
            />
            <Checkbox
              checked={numbers}
              onChange={(e) => {
                setNumbers(e);
                generatePassword();
              }}
              label="Numbers (0-9)"
            />
            <Checkbox
              checked={special}
              onChange={(e) => {
                setSpecial(e);
                generatePassword();
              }}
              label="Special (!@#$...)"
            />
          </div>

          <Checkbox
            checked={excludeAmbiguous}
            onChange={(e) => {
              setExcludeAmbiguous(e);
              generatePassword();
            }}
            label="Exclude ambiguous characters (0, O, l, 1, i, I)"
          />
        </CardContent>
      </Card>

      {/* Output */}
      {password && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Password</CardTitle>
            <div className="flex items-center gap-2">
              {!password.includes('Please select') && (
                <span className={`text-sm font-medium ${getStrength()}`}>
                  {getStrength() === 'text-green-500' && 'Strong'}
                  {getStrength() === 'text-yellow-500' && 'Medium'}
                  {getStrength() === 'text-red-500' && 'Weak'}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={password.includes('Please select')}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-md bg-muted font-mono text-lg break-all">{password}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
