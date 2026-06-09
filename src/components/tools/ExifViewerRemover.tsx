'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Check, Copy, Download, Eye, Image as ImageIcon, Loader2, Shield, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCopyToClipboard } from '@/hooks';

type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp';

type ExifField = {
  label: string;
  value: string;
};

type ExifSection = {
  title: string;
  fields: ExifField[];
};

const TAG_NAMES: Record<number, string> = {
  0x010f: 'Camera Make',
  0x0110: 'Camera Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'Modified',
  0x013b: 'Artist',
  0x8298: 'Copyright',
  0x829a: 'Exposure Time',
  0x829d: 'Aperture',
  0x8827: 'ISO',
  0x9003: 'Taken',
  0x9004: 'Digitized',
  0x9201: 'Shutter Speed',
  0x9202: 'Aperture Value',
  0x9204: 'Exposure Bias',
  0x9207: 'Metering Mode',
  0x9209: 'Flash',
  0x920a: 'Focal Length',
  0x927c: 'Maker Note',
  0x9286: 'Comment',
  0xa002: 'Width',
  0xa003: 'Height',
  0xa405: 'Focal Length (35mm)',
  0xa406: 'Scene Capture Type',
  0xa430: 'Owner',
  0xa431: 'Serial Number',
  0xa432: 'Lens Info',
  0xa433: 'Lens Make',
  0xa434: 'Lens Model',
  0x0001: 'Latitude Ref',
  0x0002: 'Latitude',
  0x0003: 'Longitude Ref',
  0x0004: 'Longitude',
  0x0005: 'Altitude Ref',
  0x0006: 'Altitude',
  0x0012: 'Map Datum',
  0x001d: 'Captured',
};

const TYPE_SIZES: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  9: 4,
  10: 8,
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatNumber(value: number, maximumFractionDigits = 6): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(value);
}

function getFileBaseName(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? filename : filename.slice(0, lastDotIndex);
}

function clampText(value: string, maxLength = 140): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`;
}

function getString(view: DataView, start: number, length: number): string {
  const bytes: string[] = [];

  for (let index = 0; index < length && start + index < view.byteLength; index += 1) {
    const byte = view.getUint8(start + index);

    if (byte === 0) {
      break;
    }

    bytes.push(String.fromCharCode(byte));
  }

  return bytes.join('').trim();
}

function getTagValue(
  view: DataView,
  tiffStart: number,
  type: number,
  count: number,
  valueOffset: number,
  littleEndian: boolean
): string {
  const typeSize = TYPE_SIZES[type];

  if (!typeSize) {
    return 'Unsupported value type';
  }

  const totalSize = typeSize * count;
  const valueStart =
    totalSize <= 4 ? valueOffset : tiffStart + view.getUint32(valueOffset, littleEndian);

  if (valueStart < 0 || valueStart >= view.byteLength) {
    return 'Out of bounds';
  }

  const readUnsigned = (offset: number) => {
    if (type === 1 || type === 7) return view.getUint8(offset);
    if (type === 3) return view.getUint16(offset, littleEndian);
    if (type === 4) return view.getUint32(offset, littleEndian);
    return 0;
  };

  const readSigned = (offset: number) => {
    if (type === 9) return view.getInt32(offset, littleEndian);
    return 0;
  };

  const readRational = (offset: number) => {
    const numerator = type === 10
      ? view.getInt32(offset, littleEndian)
      : view.getUint32(offset, littleEndian);
    const denominator = type === 10
      ? view.getInt32(offset + 4, littleEndian)
      : view.getUint32(offset + 4, littleEndian);

    if (denominator === 0) {
      return '0';
    }

    const raw = numerator / denominator;

    if (Math.abs(raw) < 1) {
      return `${numerator}/${denominator}`;
    }

    return formatNumber(raw);
  };

  if (type === 2) {
    return clampText(getString(view, valueStart, count)) || 'Empty';
  }

  if (type === 5 || type === 10) {
    const values: string[] = [];

    for (let index = 0; index < count; index += 1) {
      values.push(readRational(valueStart + index * 8));
    }

    return values.join(', ');
  }

  const values: Array<number | string> = [];

  for (let index = 0; index < count; index += 1) {
    const itemOffset = valueStart + index * typeSize;

    if (itemOffset + typeSize > view.byteLength) {
      break;
    }

    if (type === 9) {
      values.push(readSigned(itemOffset));
    } else {
      values.push(readUnsigned(itemOffset));
    }
  }

  return values.join(', ');
}

function parseIfd(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  littleEndian: boolean,
  title: string,
  visited: Set<number>
): ExifSection[] {
  const absoluteOffset = tiffStart + ifdOffset;

  if (visited.has(absoluteOffset) || absoluteOffset + 2 > view.byteLength) {
    return [];
  }

  visited.add(absoluteOffset);

  const entryCount = view.getUint16(absoluteOffset, littleEndian);
  const fields: ExifField[] = [];
  let exifPointer: number | null = null;
  let gpsPointer: number | null = null;

  for (let index = 0; index < entryCount; index += 1) {
    const entryOffset = absoluteOffset + 2 + index * 12;

    if (entryOffset + 12 > view.byteLength) {
      break;
    }

    const tag = view.getUint16(entryOffset, littleEndian);
    const type = view.getUint16(entryOffset + 2, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);
    const label = TAG_NAMES[tag] ?? `Tag 0x${tag.toString(16).padStart(4, '0')}`;

    if (tag === 0x8769) {
      exifPointer = view.getUint32(entryOffset + 8, littleEndian);
      continue;
    }

    if (tag === 0x8825) {
      gpsPointer = view.getUint32(entryOffset + 8, littleEndian);
      continue;
    }

    const value = getTagValue(view, tiffStart, type, count, entryOffset + 8, littleEndian);

    if (value && value !== 'Maker Note') {
      fields.push({ label, value });
    }
  }

  const sections: ExifSection[] = fields.length > 0 ? [{ title, fields }] : [];

  if (exifPointer !== null) {
    sections.push(
      ...parseIfd(view, tiffStart, exifPointer, littleEndian, 'EXIF', visited)
    );
  }

  if (gpsPointer !== null) {
    sections.push(
      ...parseIfd(view, tiffStart, gpsPointer, littleEndian, 'GPS', visited)
    );
  }

  return sections;
}

function parseExifSections(buffer: ArrayBuffer): ExifSection[] {
  const view = new DataView(buffer);

  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return [];
  }

  let offset = 2;

  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    offset += 2;

    if (marker === 0xffda || marker === 0xffd9) {
      break;
    }

    const segmentLength = view.getUint16(offset);

    if (segmentLength < 2 || offset + segmentLength > view.byteLength) {
      break;
    }

    if (marker === 0xffe1 && getString(view, offset + 2, 6) === 'Exif') {
      const tiffStart = offset + 8;
      const byteOrder = getString(view, tiffStart, 2);
      const littleEndian = byteOrder === 'II';

      if (!littleEndian && byteOrder !== 'MM') {
        return [];
      }

      if (view.getUint16(tiffStart + 2, littleEndian) !== 42) {
        return [];
      }

      const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
      const visited = new Set<number>();
      const sections = parseIfd(
        view,
        tiffStart,
        firstIfdOffset,
        littleEndian,
        'Image',
        visited
      );

      return sections
        .map((section) => ({
          title: section.title,
          fields: section.fields.filter((field, index, array) => {
            return array.findIndex((candidate) => candidate.label === field.label) === index;
          }),
        }))
        .filter((section) => section.fields.length > 0);
    }

    offset += segmentLength;
  }

  return [];
}

async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load the selected image.'));
    image.src = url;
  });
}

export function ExifViewerRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cleanUrl, setCleanUrl] = useState<string | null>(null);
  const [cleanFile, setCleanFile] = useState<File | null>(null);
  const [sections, setSections] = useState<ExifSection[]>([]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyResult = useCopyToClipboard();

  const handleCopyField = async (value: string, label: string) => {
    await copyResult.copyToClipboard(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    const nextFile = input.files?.[0];

    if (!nextFile) {
      return;
    }

    setError('');
    setFile(nextFile);
    setCleanFile(null);
    setSections([]);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (cleanUrl) {
      URL.revokeObjectURL(cleanUrl);
      setCleanUrl(null);
    }

    const nextPreviewUrl = URL.createObjectURL(nextFile);
    setPreviewUrl(nextPreviewUrl);

    try {
      const buffer = await nextFile.arrayBuffer();
      setSections(parseExifSections(buffer));
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : 'Unable to inspect metadata for the selected file.'
      );
    }
  };

  const handleRemoveMetadata = async () => {
    if (!file || !previewUrl) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const image = await loadImageFromUrl(previewUrl);
      const canvas = canvasRef.current;

      if (!canvas) {
        throw new Error('Canvas is not available for cleanup.');
      }

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context is not available for cleanup.');
      }

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      const selectedFormat = outputFormat === 'original'
        ? (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/jpeg'
            ? file.type
            : 'image/png')
        : `image/${outputFormat}`;

      const extension = selectedFormat === 'image/jpeg'
        ? 'jpg'
        : selectedFormat === 'image/png'
          ? 'png'
          : 'webp';

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(new Error('Unable to generate a metadata-free image.'));
              return;
            }

            resolve(result);
          },
          selectedFormat,
          selectedFormat === 'image/png' ? 1 : 0.92
        );
      });

      if (cleanUrl) {
        URL.revokeObjectURL(cleanUrl);
      }

      const nextCleanFile = new File([blob], `${getFileBaseName(file.name)}-clean.${extension}`, {
        type: selectedFormat,
      });

      setCleanFile(nextCleanFile);
      setCleanUrl(URL.createObjectURL(nextCleanFile));
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Unable to remove metadata from the selected image.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!cleanUrl || !cleanFile) {
      return;
    }

    const link = document.createElement('a');
    link.href = cleanUrl;
    link.download = cleanFile.name;
    link.click();
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (cleanUrl) {
      URL.revokeObjectURL(cleanUrl);
    }

    setFile(null);
    setPreviewUrl(null);
    setCleanUrl(null);
    setCleanFile(null);
    setSections([]);
    setError('');
    setProcessing(false);
    setOutputFormat('original');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const metadataSummary = sections.flatMap((section) => section.fields);

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Image
          </CardTitle>
          <CardDescription>
            Inspect image metadata locally in your browser and optionally export a cleaned copy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
          />

          {file && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  File
                </div>
                <div className="mt-1 break-all font-semibold">{file.name}</div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Type
                </div>
                <div className="mt-1 font-mono text-sm">{file.type || 'Unknown'}</div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Size
                </div>
                <div className="mt-1 font-semibold">{formatBytes(file.size)}</div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  EXIF fields
                </div>
                <div className="mt-1 font-semibold">{metadataSummary.length}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {file && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata Removal</CardTitle>
            <CardDescription>
              Re-encode the image in the browser to remove embedded metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Output format</label>
              <Select
                value={outputFormat}
                onValueChange={(value) => setOutputFormat(value as OutputFormat)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select output format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="original">Keep original format when supported</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleRemoveMetadata} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing metadata...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Remove metadata
                  </>
                )}
              </Button>
              <Button onClick={handleDownload} disabled={!cleanUrl || !cleanFile} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download cleaned image
              </Button>
              <Button onClick={handleClear} variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {cleanFile && (
              <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
                Cleaned image ready: {cleanFile.name} ({formatBytes(cleanFile.size)})
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {file && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Metadata Viewer
            </CardTitle>
            <CardDescription>
              JPEG EXIF tags are shown when present. Other image formats may have little or no EXIF metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.length > 0 ? (
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.title} className="rounded-md border">
                    <div className="border-b px-4 py-3 font-medium">{section.title}</div>
                    <div className="divide-y">
                      {section.fields.map((field) => (
                        <div
                          key={`${section.title}-${field.label}`}
                          className="grid gap-2 px-4 py-3 sm:grid-cols-[180px_1fr_auto] sm:items-start"
                        >
                          <div className="text-sm font-medium">{field.label}</div>
                          <div className="break-all font-mono text-sm text-muted-foreground">
                            {field.value}
                          </div>
                           <Button
                            onClick={() => handleCopyField(field.value, field.label)}
                            variant={copiedField === field.label ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Copy ${field.label}`}
                          >
                            {copiedField === field.label ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                No EXIF fields were detected in this file, or the format does not expose EXIF data in this viewer.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {file && previewUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Preview
            </CardTitle>
            <CardDescription>Original image and optional cleaned export.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium">Original</p>
                <img src={previewUrl} alt="Original upload" className="w-full rounded-md border" />
              </div>
              {cleanUrl && (
                <div>
                  <p className="mb-2 text-sm font-medium">Cleaned</p>
                  <img src={cleanUrl} alt="Metadata removed" className="w-full rounded-md border" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
