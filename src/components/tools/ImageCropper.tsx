'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload, Download, Trash2, Crop } from 'lucide-react';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export function ImageCropper() {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setOriginalFile(e.target.files[0]);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height));
    }
  };

  const getCroppedImg = () => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !completedCrop) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio;
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    const base64Image = canvas.toDataURL(originalFile?.type || 'image/png');
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = `cropped-${originalFile?.name || 'image.png'}`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Image
          </CardTitle>
          <CardDescription>Select an area to crop from your image</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </CardContent>
      </Card>

      {imgSrc && (
        <Card>
          <CardHeader>
            <CardTitle>Crop Area</CardTitle>
            <div className="flex gap-2 flex-wrap mt-2">
              <Button variant={aspect === undefined ? 'default' : 'outline'} size="sm" onClick={() => setAspect(undefined)}>Free</Button>
              <Button variant={aspect === 1 ? 'default' : 'outline'} size="sm" onClick={() => setAspect(1)}>1:1</Button>
              <Button variant={aspect === 16 / 9 ? 'default' : 'outline'} size="sm" onClick={() => setAspect(16 / 9)}>16:9</Button>
              <Button variant={aspect === 4 / 3 ? 'default' : 'outline'} size="sm" onClick={() => setAspect(4 / 3)}>4:3</Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} />
            </ReactCrop>
            <div className="flex gap-2 mt-4 w-full">
              <Button onClick={getCroppedImg} disabled={!completedCrop} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Cropped Image
              </Button>
              <Button variant="outline" onClick={() => setImgSrc('')}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
