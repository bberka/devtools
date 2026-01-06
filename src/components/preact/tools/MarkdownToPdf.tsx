import { useState, useRef } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { Select } from '@/components/preact/ui/select';
import { FileText, Download, Eye, Trash2 } from 'lucide-preact';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type ExportMethod = 'jspdf' | 'print';
type PageSize = 'A4' | 'Letter';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

const defaultMarkdown = `# Document Title

This is a sample document to convert to PDF.

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

export function MarkdownToPdf() {
  const [input, setInput] = useState(defaultMarkdown);
  const [html, setHtml] = useState('');
  const [method, setMethod] = useState<ExportMethod>('jspdf');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [topMargin, setTopMargin] = useState(20);
  const [rightMargin, setRightMargin] = useState(20);
  const [bottomMargin, setBottomMargin] = useState(20);
  const [leftMargin, setLeftMargin] = useState(20);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [exporting, setExporting] = useState(false);
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

  const handleExportJsPDF = async () => {
    if (!previewRef.current) return;

    setExporting(true);

    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

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

      pdf.save('markdown-export.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPrint = () => {
    setExporting(true);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to use the print export method');
      setExporting(false);
      return;
    }

    const printStyles = `
      <style>
        @media print {
          @page {
            size: ${pageSize};
            margin: ${topMargin}mm ${rightMargin}mm ${bottomMargin}mm ${leftMargin}mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #000;
          }
          .prose {
            max-width: none;
          }
          .hljs {
            background: #f6f8fa;
            padding: 1em;
            border-radius: 4px;
          }
          a {
            color: #0969da;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #d0d7de;
            padding: 6px 13px;
          }
          th {
            background: #f6f8fa;
            font-weight: 600;
          }
        }
      </style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Markdown Export</title>
          ${printStyles}
        </head>
        <body>
          <div class="prose">
            ${html}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setExporting(false);
        // Close window after printing or canceling
        printWindow.onafterprint = () => printWindow.close();
      }, 500);
    };
  };

  const handleExport = () => {
    if (!input.trim()) {
      alert('Please enter markdown content first');
      return;
    }

    if (method === 'jspdf') {
      handleExportJsPDF();
    } else {
      handleExportPrint();
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
          <CardDescription>Configure PDF export options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Method</label>
              <Select value={method} onChange={(e) => setMethod((e.target as HTMLSelectElement).value as ExportMethod)}>
                <option value="jspdf">jsPDF (Programmatic)</option>
                <option value="print">Browser Print</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                {method === 'jspdf'
                  ? 'Generates PDF programmatically with page numbers'
                  : 'Uses browser print dialog for better rendering'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Page Size</label>
              <Select value={pageSize} onChange={(e) => setPageSize((e.target as HTMLSelectElement).value as PageSize)}>
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </Select>
            </div>
          </div>

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
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Right</label>
                <input
                  type="number"
                  value={rightMargin}
                  onInput={(e) => setRightMargin(parseInt((e.target as HTMLInputElement).value) || 0)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Bottom</label>
                <input
                  type="number"
                  value={bottomMargin}
                  onInput={(e) => setBottomMargin(parseInt((e.target as HTMLInputElement).value) || 0)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Left</label>
                <input
                  type="number"
                  value={leftMargin}
                  onInput={(e) => setLeftMargin(parseInt((e.target as HTMLInputElement).value) || 0)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          {method === 'jspdf' && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includePageNumbers}
                onChange={(e) => setIncludePageNumbers((e.target as HTMLInputElement).checked)}
              />
              Include page numbers
            </label>
          )}

          <Button onClick={handleExport} disabled={exporting || !input.trim()}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : `Export as PDF (${method === 'jspdf' ? 'jsPDF' : 'Print'})`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </CardTitle>
          <CardDescription>Preview how your PDF will look (always shown in light mode for PDF accuracy)</CardDescription>
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
