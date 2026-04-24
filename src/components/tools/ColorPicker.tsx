'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Palette,
  Pipette,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useCopyToClipboard } from '@/hooks';

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Hsl = {
  h: number;
  s: number;
  l: number;
};

type EyeDropperResult = {
  sRGBHex: string;
};

type EyeDropperConstructor = new () => {
  open: () => Promise<EyeDropperResult>;
};

declare global {
  interface Window {
    EyeDropper?: EyeDropperConstructor;
  }
}

const DEFAULT_COLOR: Rgb = { r: 59, g: 130, b: 246 };

const PRESETS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#6366F1',
  '#A855F7',
  '#EC4899',
  '#111827',
  '#64748B',
  '#FFFFFF',
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function componentToHex(value: number) {
  return clamp(value, 0, 255).toString(16).padStart(2, '0').toUpperCase();
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function hexToRgb(value: string): Rgb | null {
  const trimmed = value.trim();
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(trimmed);
  if (shorthand) {
    return {
      r: parseInt(`${shorthand[1]}${shorthand[1]}`, 16),
      g: parseInt(`${shorthand[2]}${shorthand[2]}`, 16),
      b: parseInt(`${shorthand[3]}${shorthand[3]}`, 16),
    };
  }

  const full = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(trimmed);
  if (!full) return null;

  return {
    r: parseInt(full[1], 16),
    g: parseInt(full[2], 16),
    b: parseInt(full[3], 16),
  };
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) };
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;

  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return {
    h: Math.round(hue * 60),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  if (saturation === 0) {
    const value = lightness * 255;
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let normalized = t;
    if (normalized < 0) normalized += 1;
    if (normalized > 1) normalized -= 1;
    if (normalized < 1 / 6) return p + (q - p) * 6 * normalized;
    if (normalized < 1 / 2) return q;
    if (normalized < 2 / 3) return p + (q - p) * (2 / 3 - normalized) * 6;
    return p;
  };

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: hueToRgb(p, q, hue + 1 / 3) * 255,
    g: hueToRgb(p, q, hue) * 255,
    b: hueToRgb(p, q, hue - 1 / 3) * 255,
  };
}

function mixColor(rgb: Rgb, target: 0 | 255, amount: number): Rgb {
  return {
    r: rgb.r + (target - rgb.r) * amount,
    g: rgb.g + (target - rgb.g) * amount,
    b: rgb.b + (target - rgb.b) * amount,
  };
}

function getReadableTextColor({ r, g, b }: Rgb) {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#111827' : '#FFFFFF';
}

function ColorValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const copy = useCopyToClipboard();

  return (
    <div className="flex items-center gap-2 rounded-md border border-input p-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-mono text-sm">{value}</p>
      </div>
      <Button
        size="icon"
        variant={copy.isCopied ? 'default' : 'outline'}
        onClick={() => copy.copyToClipboard(value)}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
      >
        {copy.isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export function ColorPicker() {
  const [rgb, setRgb] = useState<Rgb>(DEFAULT_COLOR);
  const [hexInput, setHexInput] = useState(rgbToHex(DEFAULT_COLOR));
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saveFeedbackVisible, setSaveFeedbackVisible] = useState(false);
  const [pickFeedbackVisible, setPickFeedbackVisible] = useState(false);
  const [resetFeedbackVisible, setResetFeedbackVisible] = useState(false);

  const hex = rgbToHex(rgb);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const textColor = getReadableTextColor(rgb);
  const eyeDropperSupported =
    typeof window !== 'undefined' && 'EyeDropper' in window;

  const values = [
    { label: 'HEX', value: hex },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'CSS Var', value: `--color-picked: ${hex};` },
  ];

  const palette = useMemo(() => {
    const variants = [
      { label: 'Shade 40', rgb: mixColor(rgb, 0, 0.4) },
      { label: 'Shade 20', rgb: mixColor(rgb, 0, 0.2) },
      { label: 'Shade 10', rgb: mixColor(rgb, 0, 0.1) },
      { label: 'Base', rgb },
      { label: 'Tint 10', rgb: mixColor(rgb, 255, 0.1) },
      { label: 'Tint 20', rgb: mixColor(rgb, 255, 0.2) },
      { label: 'Tint 40', rgb: mixColor(rgb, 255, 0.4) },
    ];

    return variants.map((variant) => ({
      label: variant.label,
      hex: rgbToHex(variant.rgb),
    }));
  }, [rgb]);

  const setColor = (nextRgb: Rgb) => {
    const normalized = {
      r: clamp(nextRgb.r, 0, 255),
      g: clamp(nextRgb.g, 0, 255),
      b: clamp(nextRgb.b, 0, 255),
    };

    setRgb(normalized);
    setHexInput(rgbToHex(normalized));
    setError('');
  };

  const handleHexChange = (value: string) => {
    setHexInput(value.toUpperCase());
    const nextRgb = hexToRgb(value);

    if (!nextRgb) {
      setError('Enter a valid HEX color, such as #3B82F6 or #0AF.');
      return;
    }

    setRgb(nextRgb);
    setHexInput(rgbToHex(nextRgb));
    setError('');
  };

  const handleHslChange = (key: keyof Hsl, value: number) => {
    setColor(
      hslToRgb({
        ...hsl,
        [key]: key === 'h' ? clamp(value, 0, 360) : clamp(value, 0, 100),
      })
    );
  };

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) {
      setError('This browser does not support the EyeDropper API.');
      return;
    }

    try {
      const result = await new window.EyeDropper().open();
      const nextRgb = hexToRgb(result.sRGBHex);
      if (nextRgb) {
        setColor(nextRgb);
        setPickFeedbackVisible(true);
      }
    } catch {
      setError('Color picking was canceled or blocked by the browser.');
    }
  };

  const saveCurrentColor = () => {
    setSavedColors((current) => {
      const next = [hex, ...current.filter((color) => color !== hex)];
      return next.slice(0, 12);
    });
    setSaveFeedbackVisible(true);
  };

  useEffect(() => {
    if (!saveFeedbackVisible) return;

    const timeoutId = window.setTimeout(() => {
      setSaveFeedbackVisible(false);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [saveFeedbackVisible]);

  useEffect(() => {
    if (!pickFeedbackVisible) return;

    const timeoutId = window.setTimeout(() => {
      setPickFeedbackVisible(false);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pickFeedbackVisible]);

  useEffect(() => {
    if (!resetFeedbackVisible) return;

    const timeoutId = window.setTimeout(() => {
      setResetFeedbackVisible(false);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [resetFeedbackVisible]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Picker
          </CardTitle>
          <CardDescription>
            Pick a color, tune channels, and copy production-ready values.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(220px,320px),1fr]">
          <div
            className="flex min-h-56 flex-col justify-between rounded-md border border-input p-5"
            style={{ backgroundColor: hex, color: textColor }}
          >
            <div>
              <p className="text-sm font-medium opacity-80">Selected color</p>
              <p className="mt-2 break-all font-mono text-3xl font-bold">
                {hex}
              </p>
            </div>
            <p className="text-sm opacity-80">
              {rgb.r}, {rgb.g}, {rgb.b} / {hsl.h}, {hsl.s}%, {hsl.l}%
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[80px,1fr]">
              <Input
                type="color"
                value={hex}
                onChange={(event) =>
                  setColor(hexToRgb(event.currentTarget.value) ?? rgb)
                }
                className="h-12 w-20 p-1"
                aria-label="Native color picker"
              />
              <Input
                value={hexInput}
                onChange={(event) => handleHexChange(event.currentTarget.value)}
                placeholder="#3B82F6"
                className="h-12 font-mono uppercase"
                maxLength={7}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleEyeDropper}
                variant={pickFeedbackVisible ? 'default' : 'outline'}
                disabled={!eyeDropperSupported}
                title={
                  eyeDropperSupported
                    ? 'Pick a color from the screen'
                    : 'EyeDropper is not supported in this browser'
                }
              >
                {pickFeedbackVisible ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Pipette className="h-4 w-4" />
                )}
                {pickFeedbackVisible ? 'Picked' : 'Pick From Screen'}
              </Button>
              <Button
                onClick={saveCurrentColor}
                variant={saveFeedbackVisible ? 'default' : 'outline'}
              >
                {saveFeedbackVisible ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {saveFeedbackVisible ? 'Saved' : 'Save Swatch'}
              </Button>
              <Button
                onClick={() => {
                  setColor(DEFAULT_COLOR);
                  setResetFeedbackVisible(true);
                }}
                variant={resetFeedbackVisible ? 'default' : 'outline'}
              >
                {resetFeedbackVisible ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                {resetFeedbackVisible ? 'Reset Done' : 'Reset'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>RGB Channels</CardTitle>
            <CardDescription>Adjust red, green, and blue values.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ChannelSlider
              label="Red"
              value={rgb.r}
              max={255}
              onChange={(value) => setColor({ ...rgb, r: value })}
            />
            <ChannelSlider
              label="Green"
              value={rgb.g}
              max={255}
              onChange={(value) => setColor({ ...rgb, g: value })}
            />
            <ChannelSlider
              label="Blue"
              value={rgb.b}
              max={255}
              onChange={(value) => setColor({ ...rgb, b: value })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HSL Channels</CardTitle>
            <CardDescription>Fine tune hue, saturation, and lightness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ChannelSlider
              label="Hue"
              value={hsl.h}
              max={360}
              onChange={(value) => handleHslChange('h', value)}
            />
            <ChannelSlider
              label="Saturation"
              value={hsl.s}
              max={100}
              suffix="%"
              onChange={(value) => handleHslChange('s', value)}
            />
            <ChannelSlider
              label="Lightness"
              value={hsl.l}
              max={100}
              suffix="%"
              onChange={(value) => handleHslChange('l', value)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Copy Values</CardTitle>
          <CardDescription>Use the selected color in code or design tools.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {values.map((item) => (
            <ColorValue key={item.label} label={item.label} value={item.value} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tints & Shades</CardTitle>
          <CardDescription>Click a generated swatch to use it.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {palette.map((item) => (
              <SwatchButton
                key={item.label}
                label={item.label}
                color={item.hex}
                onClick={() => setColor(hexToRgb(item.hex) ?? rgb)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preset Palette</CardTitle>
          <CardDescription>Start from common interface colors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
            {PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                className="h-12 rounded-md border border-input transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ backgroundColor: color }}
                onClick={() => setColor(hexToRgb(color) ?? rgb)}
                aria-label={`Use preset ${color}`}
                title={color}
              />
            ))}
          </div>

          {savedColors.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">Saved Swatches</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSavedColors([])}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
                {savedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-12 rounded-md border border-input transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    style={{ backgroundColor: color }}
                    onClick={() => setColor(hexToRgb(color) ?? rgb)}
                    aria-label={`Use saved swatch ${color}`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChannelSlider({
  label,
  value,
  max,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium">{label}</label>
        <span className="font-mono text-sm text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider value={value} min={0} max={max} onChange={onChange} />
    </div>
  );
}

function SwatchButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: string;
  onClick: () => void;
}) {
  const copy = useCopyToClipboard();

  return (
    <div className="overflow-hidden rounded-md border border-input">
      <button
        type="button"
        className="h-16 w-full"
        style={{ backgroundColor: color }}
        onClick={onClick}
        aria-label={`Use ${label} ${color}`}
        title={`Use ${color}`}
      />
      <div className="flex items-center gap-1 p-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{label}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {color}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => copy.copyToClipboard(color)}
          aria-label={`Copy ${color}`}
          title={`Copy ${color}`}
        >
          {copy.isCopied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
