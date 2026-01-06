import { useState, useEffect } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Input } from '@/components/preact/ui/input';
import { Copy, Palette, Trash2 } from 'lucide-preact';

interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
}

export function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('59, 130, 246');
  const [hsl, setHsl] = useState('217, 91%, 60%');
  const [hsv, setHsv] = useState('217, 76%, 96%');
  const [error, setError] = useState('');

  useEffect(() => {
    updateFromHex(hex);
  }, []);

  const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const updateFromHex = (hexValue: string) => {
    try {
      const rgbValues = hexToRgb(hexValue);
      if (!rgbValues) {
        setError('Invalid hex color');
        return;
      }

      const [r, g, b] = rgbValues;
      const [h, s, l] = rgbToHsl(r, g, b);
      const [hv, sv, v] = rgbToHsv(r, g, b);

      setRgb(`${r}, ${g}, ${b}`);
      setHsl(`${h}, ${s}%, ${l}%`);
      setHsv(`${hv}, ${sv}%, ${v}%`);
      setError('');
    } catch (e) {
      setError('Invalid color value');
    }
  };

  const updateFromRgb = (rgbValue: string) => {
    try {
      const match = rgbValue.match(/(\d+),?\s*(\d+),?\s*(\d+)/);
      if (!match) {
        setError('Invalid RGB format. Use: 255, 128, 0');
        return;
      }

      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);

      if (r > 255 || g > 255 || b > 255 || r < 0 || g < 0 || b < 0) {
        setError('RGB values must be between 0 and 255');
        return;
      }

      const hexValue = rgbToHex(r, g, b);
      const [h, s, l] = rgbToHsl(r, g, b);
      const [hv, sv, v] = rgbToHsv(r, g, b);

      setHex(hexValue);
      setHsl(`${h}, ${s}%, ${l}%`);
      setHsv(`${hv}, ${sv}%, ${v}%`);
      setError('');
    } catch (e) {
      setError('Invalid RGB value');
    }
  };

  const updateFromHsl = (hslValue: string) => {
    try {
      const match = hslValue.match(/(\d+),?\s*(\d+)%?,?\s*(\d+)%?/);
      if (!match) {
        setError('Invalid HSL format. Use: 217, 91%, 60%');
        return;
      }

      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = parseInt(match[3]);

      if (h > 360 || s > 100 || l > 100 || h < 0 || s < 0 || l < 0) {
        setError('Invalid HSL values');
        return;
      }

      const [r, g, b] = hslToRgb(h, s, l);
      const hexValue = rgbToHex(r, g, b);
      const [hv, sv, v] = rgbToHsv(r, g, b);

      setHex(hexValue);
      setRgb(`${r}, ${g}, ${b}`);
      setHsv(`${hv}, ${sv}%, ${v}%`);
      setError('');
    } catch (e) {
      setError('Invalid HSL value');
    }
  };

  const handleCopy = async (value: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(value);
    }
  };

  const handleClear = () => {
    setHex('#000000');
    setRgb('0, 0, 0');
    setHsl('0, 0%, 0%');
    setHsv('0, 0%, 0%');
    setError('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Preview
          </CardTitle>
          <CardDescription>Current color</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className="w-32 h-32 rounded-lg border-2 border-border"
              style={{ backgroundColor: hex }}
            />
            <div className="flex-1 space-y-2">
              <div className="text-2xl font-mono font-bold">{hex}</div>
              <div className="text-sm text-muted-foreground">
                Click on any format below to copy it
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>HEX</CardTitle>
          <CardDescription>Hexadecimal color code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={hex}
            onInput={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setHex(value);
              updateFromHex(value);
            }}
            placeholder="#3b82f6"
            className="font-mono"
          />
          <Button onClick={() => handleCopy(hex)} size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy HEX
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RGB</CardTitle>
          <CardDescription>Red, Green, Blue (0-255)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={rgb}
            onInput={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setRgb(value);
              updateFromRgb(value);
            }}
            placeholder="59, 130, 246"
            className="font-mono"
          />
          <Button onClick={() => handleCopy(`rgb(${rgb})`)} size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy RGB
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HSL</CardTitle>
          <CardDescription>Hue, Saturation, Lightness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={hsl}
            onInput={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setHsl(value);
              updateFromHsl(value);
            }}
            placeholder="217, 91%, 60%"
            className="font-mono"
          />
          <Button onClick={() => handleCopy(`hsl(${hsl})`)} size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy HSL
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HSV</CardTitle>
          <CardDescription>Hue, Saturation, Value (read-only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={hsv} readOnly className="font-mono bg-muted" />
          <Button onClick={() => handleCopy(`hsv(${hsv})`)} size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy HSV
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleClear} variant="outline">
        <Trash2 className="h-4 w-4 mr-2" />
        Clear All
      </Button>
    </div>
  );
}
