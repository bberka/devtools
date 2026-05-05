'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Upload, Download, Trash2, Scissors } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export function PdfSplit() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [range, setRange] = useState('');
  const [splitting, setSplitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setPdfFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
      setRange(`1-${pdf.getPageCount()}`);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const splitPdf = async () => {
    if (!pdfFile || !range) return;
    setSplitting(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const ranges = range.split(',').map((r) => r.trim());
      const pagesToExtract: number[] = [];

      ranges.forEach((r) => {
        if (r.includes('-')) {
          const [start, end] = r.split('-').map(Number);
          for (let i = start; i <= end; i++) {
            if (i > 0 && i <= pageCount) pagesToExtract.push(i - 1);
          }
        } else {
          const page = Number(r);
          if (page > 0 && page <= pageCount) pagesToExtract.push(page - 1);
        }
      });

      // Remove duplicates and sort
      const uniquePages = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);
      
      const copiedPages = await newPdf.copyPages(pdf, uniquePages);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes] as any, { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `split-${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error splitting PDF:', error);
    } finally {
      setSplitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Split PDF
          </CardTitle>
          <CardDescription>Extract specific pages or ranges from a PDF document</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </CardContent>
      </Card>

      {pdfFile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Split Options</CardTitle>
            <CardDescription>PDF contains {pageCount} pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Page Range (e.g. 1-3, 5, 7-10)</label>
              <Input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="1-3, 5"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={splitPdf} disabled={splitting || !range} className="flex-1">
                {splitting ? 'Splitting...' : 'Extract Pages'}
              </Button>
              <Button variant="outline" onClick={() => setPdfFile(null)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
