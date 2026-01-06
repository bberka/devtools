import { useState } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { GitCompare, Trash2 } from 'lucide-preact';
import { diffLines, diffWords } from 'diff';

type DiffMode = 'lines' | 'words';
type ViewMode = 'side-by-side' | 'inline';

export function TextDiff() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [diffMode, setDiffMode] = useState<DiffMode>('lines');
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');

  const getDiff = () => {
    if (!leftText && !rightText) return [];

    if (diffMode === 'lines') {
      return diffLines(leftText, rightText);
    } else {
      return diffWords(leftText, rightText);
    }
  };

  const handleClear = () => {
    setLeftText('');
    setRightText('');
  };

  const renderInlineDiff = () => {
    const diff = getDiff();

    return (
      <div className="font-mono text-sm whitespace-pre-wrap border rounded-md p-4 min-h-[400px]">
        {diff.map((part, index) => {
          const bgColor = part.added
            ? 'bg-green-500/20'
            : part.removed
            ? 'bg-red-500/20'
            : '';
          const textColor = part.added
            ? 'text-green-700 dark:text-green-400'
            : part.removed
            ? 'text-red-700 dark:text-red-400'
            : '';

          return (
            <span key={index} className={`${bgColor} ${textColor}`}>
              {part.value}
            </span>
          );
        })}
      </div>
    );
  };

  const renderSideBySideDiff = () => {
    const diff = getDiff();
    const leftLines: { text: string; type: 'removed' | 'unchanged' | 'added' | 'empty' }[] = [];
    const rightLines: { text: string; type: 'removed' | 'unchanged' | 'added' | 'empty' }[] = [];

    diff.forEach((part) => {
      const lines = part.value.split('\n');

      if (part.added) {
        lines.forEach((line: string) => {
          if (line || lines.length > 1) {
            leftLines.push({ text: '', type: 'empty' });
            rightLines.push({ text: line, type: 'added' });
          }
        });
      } else if (part.removed) {
        lines.forEach((line: string) => {
          if (line || lines.length > 1) {
            leftLines.push({ text: line, type: 'removed' });
            rightLines.push({ text: '', type: 'empty' });
          }
        });
      } else {
        lines.forEach((line: string) => {
          if (line || lines.length > 1) {
            leftLines.push({ text: line, type: 'unchanged' });
            rightLines.push({ text: line, type: 'unchanged' });
          }
        });
      }
    });

    // Remove last empty line if it exists
    if (leftLines.length > 0 && !leftLines[leftLines.length - 1].text) {
      leftLines.pop();
      rightLines.pop();
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="border rounded-md">
          <div className="bg-muted px-4 py-2 font-medium text-sm border-b">Original</div>
          <div className="font-mono text-sm min-h-[400px]">
            {leftLines.map((line, index) => (
              <div
                key={index}
                className={`px-4 py-1 ${
                  line.type === 'removed'
                    ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                    : line.type === 'empty'
                    ? 'bg-gray-500/10'
                    : ''
                }`}
              >
                {line.text || ' '}
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-md">
          <div className="bg-muted px-4 py-2 font-medium text-sm border-b">Modified</div>
          <div className="font-mono text-sm min-h-[400px]">
            {rightLines.map((line, index) => (
              <div
                key={index}
                className={`px-4 py-1 ${
                  line.type === 'added'
                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                    : line.type === 'empty'
                    ? 'bg-gray-500/10'
                    : ''
                }`}
              >
                {line.text || ' '}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Diff Mode:</label>
            <div className="flex gap-2">
              <Button
                onClick={() => setDiffMode('lines')}
                variant={diffMode === 'lines' ? 'default' : 'outline'}
                size="sm"
              >
                Lines
              </Button>
              <Button
                onClick={() => setDiffMode('words')}
                variant={diffMode === 'words' ? 'default' : 'outline'}
                size="sm"
              >
                Words
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">View:</label>
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('side-by-side')}
                variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
                size="sm"
              >
                Side by Side
              </Button>
              <Button
                onClick={() => setViewMode('inline')}
                variant={viewMode === 'inline' ? 'default' : 'outline'}
                size="sm"
              >
                Inline
              </Button>
            </div>
          </div>
        </div>

        <Button onClick={handleClear} variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Original Text</CardTitle>
            <CardDescription>Paste the original text here</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={leftText}
              onInput={(e: Event) => setLeftText((e.target as HTMLTextAreaElement).value)}
              placeholder="Enter original text..."
              rows={12}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modified Text</CardTitle>
            <CardDescription>Paste the modified text here</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={rightText}
              onInput={(e: Event) => setRightText((e.target as HTMLTextAreaElement).value)}
              placeholder="Enter modified text..."
              rows={12}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Difference Visualization
          </CardTitle>
          <CardDescription>
            {leftText || rightText
              ? viewMode === 'side-by-side'
                ? 'Side-by-side comparison'
                : 'Inline comparison'
              : 'Enter text in both fields to see the diff'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'side-by-side' ? renderSideBySideDiff() : renderInlineDiff()}
        </CardContent>
      </Card>
    </div>
  );
}
