'use client';

import { useMemo, useState } from 'react';
import { AlignLeft, Check, Copy, Eraser, Timer, Type } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useCopyToClipboard } from '@/hooks';

const AVERAGE_READING_WPM = 200;
const AVERAGE_SPEAKING_WPM = 130;

type CounterStats = {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingMinutes: number;
  speakingMinutes: number;
  longestWord: string;
  averageWordLength: number;
};

function getStats(text: string, includeNumbers: boolean): CounterStats {
  const normalized = text.replace(/\r\n/g, '\n');
  const words = normalized.match(includeNumbers ? /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu : /[\p{L}]+(?:['’-][\p{L}]+)*/gu) ?? [];
  const nonEmptyParagraphs = normalized
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const nonEmptyLines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const sentenceMatches =
    normalized.match(/[^\s].*?[.!?]+(?=\s|$)|[^\s].+$/gm)?.map((match) => match.trim()) ?? [];
  const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
  const longestWord =
    words.reduce((longest, word) => (word.length > longest.length ? word : longest), '') || '—';

  return {
    words: words.length,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    sentences: sentenceMatches.length,
    paragraphs: nonEmptyParagraphs.length,
    lines: normalized ? normalized.split('\n').length : 0,
    readingMinutes: words.length / AVERAGE_READING_WPM,
    speakingMinutes: words.length / AVERAGE_SPEAKING_WPM,
    longestWord,
    averageWordLength: words.length > 0 ? totalWordLength / words.length : 0,
  };
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) {
    return '0 sec';
  }

  const totalSeconds = Math.max(1, Math.round(minutes * 60));
  if (totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }

  const wholeMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds === 0) {
    return `${wholeMinutes} min`;
  }

  return `${wholeMinutes} min ${seconds} sec`;
}

export function WordCounter() {
  const [text, setText] = useState('');
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const stats = useMemo(() => getStats(text, includeNumbers), [includeNumbers, text]);

  const statCards = [
    { label: 'Words', value: stats.words, icon: Type },
    { label: 'Characters', value: stats.characters, icon: AlignLeft },
    { label: 'No Spaces', value: stats.charactersNoSpaces, icon: AlignLeft },
    { label: 'Sentences', value: stats.sentences, icon: AlignLeft },
    { label: 'Paragraphs', value: stats.paragraphs, icon: AlignLeft },
    { label: 'Lines', value: stats.lines, icon: AlignLeft },
  ];

  const insights = [
    { label: 'Read Time', value: formatDuration(stats.readingMinutes) },
    { label: 'Speak Time', value: formatDuration(stats.speakingMinutes) },
    {
      label: 'Avg Word Length',
      value: stats.words > 0 ? `${stats.averageWordLength.toFixed(1)} chars` : '0.0 chars',
    },
    { label: 'Longest Word', value: stats.longestWord },
  ];

  const handleClear = () => {
    setText('');
  };

  const handleCopy = async () => {
    await copyToClipboard(text);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Input Text
          </CardTitle>
          <CardDescription>
            Paste or type text to count words, characters, sentences, and estimated reading time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(event) => setText((event.target as HTMLTextAreaElement).value)}
            placeholder="Paste text here..."
            rows={12}
            className="font-mono text-sm"
          />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Checkbox
              checked={includeNumbers}
              onCheckedChange={setIncludeNumbers}
              label="Count numbers as words"
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={handleCopy}
                disabled={!text}
                variant={isCopied ? 'default' : 'outline'}
                size="sm"
                className="min-h-11 sm:min-h-9"
              >
                {isCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Text
                  </>
                )}
              </Button>
              <Button
                onClick={handleClear}
                disabled={!text}
                variant="outline"
                size="sm"
                className="min-h-11 sm:min-h-9"
              >
                <Eraser className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4" />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Quick Insights
          </CardTitle>
          <CardDescription>
            Lightweight estimates for reading, speaking, and text complexity.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight) => (
            <div
              key={insight.label}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
            >
              <span className="text-sm text-muted-foreground">{insight.label}</span>
              <Badge variant="outline" className="max-w-[60%] truncate">
                {insight.value}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
