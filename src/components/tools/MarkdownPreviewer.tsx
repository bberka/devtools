'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Eye, FileText, Copy, Check, Trash2 } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Initialize markdown-it with plugins
const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true, // Enable line breaks
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${escapeHtml(str)}</code></pre>`;
  }
});

const md = markdown.use(texmath, {
  engine: katex,
  delimiters: 'dollars',
  katexOptions: { macros: { "\\RR": "\\mathbb{R}" } }
});

const defaultMarkdown = `# Markdown Previewer

Welcome to the **Markdown Previewer**! This tool supports:

## Features

- **Bold** and *italic* text
- [Links](https://example.com)
- \`inline code\`
- Lists and more!

### Code Blocks

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Bullet point
- Another point

### Blockquotes

> This is a blockquote
> It can span multiple lines

### Tables

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

export function MarkdownPreviewer() {
  const [input, setInput] = useState(defaultMarkdown);
  const [output, setOutput] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  useEffect(() => {
    renderMarkdown(input);
  }, []);

  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      setOutput('');
      return;
    }

    try {
      const html = md.render(text);
      setOutput(html);
    } catch (e) {
      setOutput('<div class="text-destructive">Error rendering markdown</div>');
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    renderMarkdown(text);
  };


  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Markdown Input
          </CardTitle>
          <CardDescription>Write your markdown here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => handleInputChange((e.target as HTMLTextAreaElement).value)}
            placeholder="# Enter your markdown here..."
            rows={20}
            className="font-mono text-sm"
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => copyToClipboard(input)}
              variant={isCopied ? "default" : "outline"}
              size="sm"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Markdown
                </>
              )}
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </CardTitle>
          <CardDescription>Live preview of your markdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm dark:prose-invert max-w-none min-h-[480px] p-4 border rounded-md overflow-auto"
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
