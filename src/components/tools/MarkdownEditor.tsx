'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Eye,
  FileText,
  Copy,
  Check,
  Trash2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
  Code,
  Quote,
  Download,
  FileCode,
} from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdownLanguage from 'highlight.js/lib/languages/markdown';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
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

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdownLanguage);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

const markdown = new MarkdownIt({
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
    return `<pre class="hljs"><code>${escapeHtml(str)}</code></pre>`;
  }
});

const md = markdown.use(texmath, {
  engine: katex,
  delimiters: 'dollars',
  katexOptions: { macros: { "\\RR": "\\mathbb{R}" } }
});

const defaultMarkdown = `# Markdown Editor

Welcome to the **Markdown Editor**!

## Features

- **Live Preview**
- **Toolbar Actions** (Bold, Italic, etc.)
- **LaTeX Support**: $\\frac{1}{n} \\sum_{i=1}^{n} x_i$
- **Code Highlighting**
- **HTML Export**

### Code Blocks

\`\`\`javascript
function greet() {
  console.log("Hello!");
}
\`\`\`
`;

export function MarkdownEditor() {
  const [input, setInput] = useState(defaultMarkdown);
  const [output, setOutput] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    renderMarkdown(input);
  }, []);

  const renderMarkdown = (text: string) => {
    try {
      setOutput(md.render(text || ''));
    } catch (e) {
      setOutput('<div class="text-destructive">Error rendering markdown</div>');
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    renderMarkdown(text);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = input.substring(start, end);
    const replacement = before + selection + after;
    const newValue = input.substring(0, start) + replacement + input.substring(end);

    setInput(newValue);
    renderMarkdown(newValue);

    // Set focus back and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const exportHtml = () => {
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.html';
    link.click();
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 flex flex-wrap gap-1">
          <Button variant="outline" size="icon" onClick={() => insertText('# ', '')} title="H1"><Heading1 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => insertText('## ', '')} title="H2"><Heading2 className="h-4 w-4" /></Button>
          <div className="w-[1px] h-8 bg-border mx-1" />
          <Button variant="outline" size="icon" onClick={() => insertText('**', '**')} title="Bold"><Bold className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => insertText('_', '_')} title="Italic"><Italic className="h-4 w-4" /></Button>
          <div className="w-[1px] h-8 bg-border mx-1" />
          <Button variant="outline" size="icon" onClick={() => insertText('- ', '')} title="Unordered List"><List className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => insertText('1. ', '')} title="Ordered List"><ListOrdered className="h-4 w-4" /></Button>
          <div className="w-[1px] h-8 bg-border mx-1" />
          <Button variant="outline" size="icon" onClick={() => insertText('[', '](url)')} title="Link"><Link className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => insertText('`', '`')} title="Inline Code"><Code className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => insertText('> ', '')} title="Quote"><Quote className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Write markdown here..."
              className="min-h-[500px] font-mono text-sm leading-relaxed"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" /> Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none min-h-[500px] p-4 border rounded-md overflow-auto bg-card"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => copyToClipboard(input)} variant={isCopied ? "default" : "outline"} className="flex-1">
          {isCopied ? <><Check className="h-4 w-4 mr-2" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy Markdown</>}
        </Button>
        <Button onClick={exportHtml} variant="outline" className="flex-1">
          <FileCode className="h-4 w-4 mr-2" /> Export HTML
        </Button>
        <Button onClick={() => setInput('')} variant="outline" className="flex-1">
          <Trash2 className="h-4 w-4 mr-2" /> Clear
        </Button>
      </div>
    </div>
  );
}
