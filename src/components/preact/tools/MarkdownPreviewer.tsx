import { useState, useEffect } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { Eye, FileText, Copy, Trash2 } from 'lucide-preact';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Initialize markdown-it with plugins
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

  const handleCopy = async () => {
    if (input) {
      await navigator.clipboard.writeText(input);
    }
  };

  const handleCopyHtml = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
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
            onInput={(e) => handleInputChange((e.target as HTMLTextAreaElement).value)}
            placeholder="# Enter your markdown here..."
            rows={20}
            className="font-mono text-sm"
          />

          <div className="flex items-center gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy Markdown
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
        <CardContent className="space-y-4">
          <div
            className="prose prose-sm dark:prose-invert max-w-none min-h-[480px] p-4 border rounded-md"
            dangerouslySetInnerHTML={{ __html: output }}
          />

          <Button onClick={handleCopyHtml} disabled={!output} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy HTML
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
