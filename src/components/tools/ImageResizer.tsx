'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Image as ImageIcon, Upload, Download, Trash2, Maximize } from 'lucide-react';

export function ImageResizer() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setOriginalImage(result);
      const img = new Image();
      img.onload = () => {
        setImgDimensions({ w: img.width, h: img.height });
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (val: string) => {
    const w = val ? parseInt(val) : '';
    setWidth(w);
    if (maintainAspectRatio && typeof w === 'number') {
      setHeight(Math.round((imgDimensions.h * w) / imgDimensions.w));
    }
  };

  const handleHeightChange = (val: string) => {
    const h = val ? parseInt(val) : '';
    setHeight(h);
    if (maintainAspectRatio && typeof h === 'number') {
      setWidth(Math.round((imgDimensions.w * h) / imgDimensions.h));
    }
  };

  const resizeImage = () => {
    if (!originalImage || !width || !height) return;
    setProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);
      setProcessedImage(canvas.toDataURL(originalFile?.type || 'image/png'));
      setProcessing(false);
    };
    img.src = originalImage;
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `resized-${originalFile?.name || 'image.png'}`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Maximize className="h-5 w-5" />
            Resize Image
          </CardTitle>
          <CardDescription>Change dimensions of your images</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </CardContent>
      </Card>

      {originalImage && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width (px)</label>
                  <Input type="number" value={width} onChange={(e) => handleWidthChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (px)</label>
                  <Input type="number" value={height} onChange={(e) => handleHeightChange(e.target.value)} />
                </div>
              </div>
              <Checkbox
                checked={maintainAspectRatio}
                onCheckedChange={setMaintainAspectRatio}
                label="Maintain aspect ratio"
              />
              <div className="flex gap-2">
                <Button onClick={resizeImage} disabled={processing}>
                  {processing ? 'Resizing...' : 'Resize Image'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOriginalImage(null);
                    setProcessedImage(null);
                  }}
                >
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Original ({imgDimensions.w}x{imgDimensions.h})</p>
                  <img src={originalImage} alt="Original" className="w-full border rounded-md" />
                </div>
                {processedImage && (
                  <div>
                    <p className="text-sm font-medium mb-2">Resized ({width}x{height})</p>
                    <img src={processedImage} alt="Resized" className="w-full border rounded-md" />
                    <Button onClick={handleDownload} className="mt-4 w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resized
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
