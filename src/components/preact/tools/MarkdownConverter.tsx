import { useState, useRef } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { Select } from '@/components/preact/ui/select';
import { FileText, Download, Eye, Trash2, Loader2 } from 'lucide-preact';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type ExportFormat = 'pdf' | 'html' | 'txt' | 'png' | 'jpg';
type PageSize = 'A4' | 'Letter';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
}).use(texmath, {
  engine: katex,
  delimiters: 'dollars',
  katexOptions: { macros: { "\\RR": "\\mathbb{R}" } }
});

const defaultMarkdown = `# Document Title

This is a sample document to convert.

## Features

- Markdown support
- Code highlighting
- Tables and lists

## Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Table

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
| Data 3   | Data 4   |
`;

export function MarkdownConverter() {
  const [input, setInput] = useState(defaultMarkdown);
  const [html, setHtml] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [topMargin, setTopMargin] = useState(20);
  const [rightMargin, setRightMargin] = useState(20);
  const [bottomMargin, setBottomMargin] = useState(20);
  const [leftMargin, setLeftMargin] = useState(20);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      setHtml('');
      return;
    }

    try {
      const rendered = md.render(text);
      setHtml(rendered);
    } catch (e) {
      setHtml('<div class="text-destructive">Error rendering markdown</div>');
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    renderMarkdown(text);
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;

    setExportProgress('Preparing canvas...');

    try {
      // Use setTimeout to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = previewRef.current;

      setExportProgress('Capturing content...');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      setExportProgress('Generating PDF...');
      await new Promise(resolve => setTimeout(resolve, 50));

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize.toLowerCase() as any,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - leftMargin - rightMargin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = topMargin;

      // Add first page
      pdf.addImage(imgData, 'PNG', leftMargin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - topMargin - bottomMargin;

      // Add additional pages if needed
      let pageNum = 1;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + topMargin;
        pdf.addPage();
        pageNum++;
        pdf.addImage(imgData, 'PNG', leftMargin, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - topMargin - bottomMargin;
      }

      // Add page numbers if enabled
      if (includePageNumbers) {
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdfWidth / 2,
            pdfHeight - 10,
            { align: 'center' }
          );
        }
      }

      setExportProgress('Saving file...');
      await new Promise(resolve => setTimeout(resolve, 50));

      pdf.save('markdown-export.pdf');
      setExportProgress('');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
      setExportProgress('');
    }
  };

  const handleExportHTML = () => {
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    .hljs {
      background: #f6f8fa;
      padding: 1em;
      border-radius: 4px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #d0d7de;
      padding: 6px 13px;
    }
    th {
      background: #f6f8fa;
      font-weight: 600;
    }
    blockquote {
      border-left: 4px solid #d0d7de;
      padding-left: 1em;
      margin-left: 0;
      color: #57606a;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'markdown-export.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTXT = () => {
    const blob = new Blob([input], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'markdown-export.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportImage = async (format: 'png' | 'jpg') => {
    if (!previewRef.current) return;

    setExportProgress(`Generating ${format.toUpperCase()}...`);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      setExportProgress('Saving image...');
      await new Promise(resolve => setTimeout(resolve, 50));

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `markdown-export.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        setExportProgress('');
      }, `image/${format === 'jpg' ? 'jpeg' : 'png'}`, 0.95);
    } catch (error) {
      console.error(`Error exporting ${format.toUpperCase()}:`, error);
      alert(`Error exporting ${format.toUpperCase()}. Please try again.`);
      setExportProgress('');
    }
  };

  const handleExport = async () => {
    if (!input.trim()) {
      alert('Please enter markdown content first');
      return;
    }

    setExporting(true);

    try {
      switch (exportFormat) {
        case 'pdf':
          await handleExportPDF();
          break;
        case 'html':
          handleExportHTML();
          break;
        case 'txt':
          handleExportTXT();
          break;
        case 'png':
          await handleExportImage('png');
          break;
        case 'jpg':
          await handleExportImage('jpg');
          break;
      }
    } finally {
      setExporting(false);
      setExportProgress('');
    }
  };

  const handleClear = () => {
    setInput('');
    setHtml('');
  };

  // Render markdown on mount
  if (!html && input) {
    renderMarkdown(input);
  }

  const showPDFOptions = exportFormat === 'pdf';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Markdown Input
          </CardTitle>
          <CardDescription>Write your markdown content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onInput={(e) => handleInputChange((e.target as HTMLTextAreaElement).value)}
            placeholder="# Enter your markdown here..."
            rows={15}
            className="font-mono text-sm"
          />

          <Button onClick={handleClear} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>Configure export options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={exportFormat} onChange={(e) => setExportFormat((e.target as HTMLSelectElement).value as ExportFormat)}>
                <option value="pdf">PDF Document</option>
                <option value="html">HTML File</option>
                <option value="txt">Plain Text (Markdown)</option>
                <option value="png">PNG Image</option>
                <option value="jpg">JPG Image</option>
              </Select>
            </div>

            {showPDFOptions && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Size</label>
                <Select value={pageSize} onChange={(e) => setPageSize((e.target as HTMLSelectElement).value as PageSize)}>
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </Select>
              </div>
            )}
          </div>

          {showPDFOptions && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Margins (mm)</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Top</label>
                    <input
                      type="number"
                      value={topMargin}
                      onInput={(e) => setTopMargin(parseInt((e.target as HTMLInputElement).value) || 0)}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={exporting}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Right</label>
                    <input
                      type="number"
                      value={rightMargin}
                      onInput={(e) => setRightMargin(parseInt((e.target as HTMLInputElement).value) || 0)}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={exporting}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Bottom</label>
                    <input
                      type="number"
                      value={bottomMargin}
                      onInput={(e) => setBottomMargin(parseInt((e.target as HTMLInputElement).value) || 0)}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={exporting}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Left</label>
                    <input
                      type="number"
                      value={leftMargin}
                      onInput={(e) => setLeftMargin(parseInt((e.target as HTMLInputElement).value) || 0)}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={exporting}
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => setIncludePageNumbers((e.target as HTMLInputElement).checked)}
                  disabled={exporting}
                />
                Include page numbers
              </label>
            </>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={handleExport} disabled={exporting || !input.trim()}>
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {exportProgress || 'Exporting...'}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export as {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
            {exporting && exportProgress && (
              <span className="text-sm text-muted-foreground">{exportProgress}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </CardTitle>
          <CardDescription>Preview how your export will look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <div
              ref={previewRef}
              className="prose prose-sm max-w-none min-h-[400px] p-8 bg-white text-black"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
