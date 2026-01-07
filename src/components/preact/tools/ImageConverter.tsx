import { useState, useRef } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Select } from '@/components/preact/ui/select';
import { Image as ImageIcon, Upload, Download, Trash2 } from 'lucide-preact';
import imageCompression from 'browser-image-compression';

type OutputFormat = 'png' | 'jpeg' | 'webp';

export function ImageConverter() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [quality, setQuality] = useState(90);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      processImage(result, file);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageSrc: string, file: File) => {
    setProcessing(true);

    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate dimensions
        let targetWidth = width || img.width;
        let targetHeight = height || img.height;

        if (maintainAspectRatio) {
          if (width && !height) {
            targetHeight = (img.height * (width as number)) / img.width;
          } else if (height && !width) {
            targetWidth = (img.width * (height as number)) / img.height;
          }
        }

        canvas.width = targetWidth as number;
        canvas.height = targetHeight as number;

        // Apply filters
        ctx.filter = `
          grayscale(${grayscale ? 100 : 0}%)
          sepia(${sepia ? 100 : 0}%)
          blur(${blur}px)
          brightness(${brightness}%)
          contrast(${contrast}%)
          saturate(${saturation}%)
        `.trim();

        // Draw image
        ctx.drawImage(img, 0, 0, targetWidth as number, targetHeight as number);

        // Convert to desired format
        const mimeType = `image/${outputFormat}`;
        const qualityValue = outputFormat === 'png' ? 1 : quality / 100;

        canvas.toBlob(
          async (blob) => {
            if (!blob) return;

            // Compress if needed
            const options = {
              maxSizeMB: 10,
              maxWidthOrHeight: Math.max(targetWidth as number, targetHeight as number),
              useWebWorker: true,
              quality: qualityValue,
            };

            try {
              const compressedFile = await imageCompression(
                new File([blob], file.name, { type: mimeType }),
                options
              );
              const url = URL.createObjectURL(compressedFile);
              setProcessedImage(url);
            } catch (error) {
              const url = URL.createObjectURL(blob);
              setProcessedImage(url);
            }

            setProcessing(false);
          },
          mimeType,
          qualityValue
        );
      };

      img.src = imageSrc;
    } catch (error) {
      console.error('Error processing image:', error);
      setProcessing(false);
    }
  };

  const handleConvert = () => {
    if (originalImage && originalFile) {
      processImage(originalImage, originalFile);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `converted.${outputFormat}`;
    link.click();
  };

  const handleClear = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setOriginalFile(null);
    setWidth('');
    setHeight('');
    setGrayscale(false);
    setSepia(false);
    setBlur(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Image
          </CardTitle>
          <CardDescription>Upload an image to convert (PNG, JPEG, WebP, GIF, BMP)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90"
          />
        </CardContent>
      </Card>

      {originalImage && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Conversion Settings</CardTitle>
              <CardDescription>Configure output format and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Output Format</label>
                  <Select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat((e.target as HTMLSelectElement).value as OutputFormat)}
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP</option>
                  </Select>
                </div>

                {outputFormat !== 'png' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quality: {quality}%</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onInput={(e) => setQuality(parseInt((e.target as HTMLInputElement).value))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Resize</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Width (px)</label>
                    <input
                      type="number"
                      value={width}
                      onInput={(e) => setWidth((e.target as HTMLInputElement).value ? parseInt((e.target as HTMLInputElement).value) : '')}
                      placeholder="Auto"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Height (px)</label>
                    <input
                      type="number"
                      value={height}
                      onInput={(e) => setHeight((e.target as HTMLInputElement).value ? parseInt((e.target as HTMLInputElement).value) : '')}
                      placeholder="Auto"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio((e.target as HTMLInputElement).checked)}
                  />
                  Maintain aspect ratio
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filters</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={grayscale}
                      onChange={(e) => setGrayscale((e.target as HTMLInputElement).checked)}
                    />
                    Grayscale
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sepia}
                      onChange={(e) => setSepia((e.target as HTMLInputElement).checked)}
                    />
                    Sepia
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Blur: {blur}px</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onInput={(e) => setBlur(parseInt((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Brightness: {brightness}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onInput={(e) => setBrightness(parseInt((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contrast: {contrast}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onInput={(e) => setContrast(parseInt((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Saturation: {saturation}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onInput={(e) => setSaturation(parseInt((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleConvert} disabled={processing}>
                  {processing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Convert'
                  )}
                </Button>
                <Button onClick={handleClear} variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription>Before and after comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Original</p>
                  <img src={originalImage} alt="Original" className="w-full border rounded-md" />
                </div>
                {processedImage && (
                  <div>
                    <p className="text-sm font-medium mb-2">Converted</p>
                    <img src={processedImage} alt="Converted" className="w-full border rounded-md" />
                  </div>
                )}
              </div>

              {processedImage && !processing && (
                <Button onClick={handleDownload} className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download Converted Image
                </Button>
              )}
              {processing && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing image...
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
