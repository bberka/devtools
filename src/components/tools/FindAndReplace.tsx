'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Eraser, Replace, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCopyToClipboard } from '@/hooks';

type MatchInfo = {
  index: number;
  text: string;
};

type ReplaceResult = {
  matches: MatchInfo[];
  output: string;
  error: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPattern(findText: string, useRegex: boolean, wholeWord: boolean): string {
  const source = useRegex ? findText : escapeRegExp(findText);
  return wholeWord ? `\\b(?:${source})\\b` : source;
}

function runReplace(
  input: string,
  findText: string,
  replaceText: string,
  caseSensitive: boolean,
  wholeWord: boolean,
  useRegex: boolean,
  replaceAll: boolean
): ReplaceResult {
  if (!findText) {
    return {
      matches: [],
      output: input,
      error: '',
    };
  }

  try {
    const pattern = buildPattern(findText, useRegex, wholeWord);
    const matchFlags = `${caseSensitive ? '' : 'i'}g`;
    const replaceFlags = `${caseSensitive ? '' : 'i'}${replaceAll ? 'g' : ''}`;
    const matchRegex = new RegExp(pattern, matchFlags);
    const replaceRegex = new RegExp(pattern, replaceFlags);

    const matches = Array.from(input.matchAll(matchRegex)).map((match) => ({
      index: match.index ?? 0,
      text: match[0],
    }));

    const output = useRegex
      ? input.replace(replaceRegex, replaceText)
      : input.replace(replaceRegex, () => replaceText);

    return {
      matches,
      output,
      error: '',
    };
  } catch (error) {
    return {
      matches: [],
      output: input,
      error: error instanceof Error ? error.message : 'Invalid search pattern',
    };
  }
}

function getHighlightedSegments(input: string, matches: MatchInfo[]) {
  if (!input || matches.length === 0) {
    return [{ text: input, isMatch: false }];
  }

  const segments: Array<{ text: string; isMatch: boolean }> = [];
  let lastIndex = 0;

  matches.forEach((match) => {
    if (match.index > lastIndex) {
      segments.push({
        text: input.slice(lastIndex, match.index),
        isMatch: false,
      });
    }

    segments.push({
      text: match.text,
      isMatch: true,
    });

    lastIndex = match.index + match.text.length;
  });

  if (lastIndex < input.length) {
    segments.push({
      text: input.slice(lastIndex),
      isMatch: false,
    });
  }

  return segments;
}

export function FindAndReplace() {
  const [input, setInput] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [replaceAll, setReplaceAll] = useState(true);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const result = useMemo(
    () =>
      runReplace(
        input,
        findText,
        replaceText,
        caseSensitive,
        wholeWord,
        useRegex,
        replaceAll
      ),
    [caseSensitive, findText, input, replaceAll, replaceText, useRegex, wholeWord]
  );

  const highlightedSegments = useMemo(
    () => getHighlightedSegments(input, result.matches),
    [input, result.matches]
  );

  const handleCopy = async () => {
    await copyToClipboard(result.output);
  };

  const handleApply = () => {
    setInput(result.output);
  };

  const handleClear = () => {
    setInput('');
    setFindText('');
    setReplaceText('');
    setCaseSensitive(false);
    setWholeWord(false);
    setUseRegex(false);
    setReplaceAll(true);
  };

  const replacementsPlanned = replaceAll
    ? result.matches.length
    : Math.min(result.matches.length, findText ? 1 : 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Setup
          </CardTitle>
          <CardDescription>
            Choose literal or regex matching, then preview replacements before applying them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="find-text" className="text-sm font-medium">
                Find
              </label>
              <Input
                id="find-text"
                value={findText}
                onChange={(event) => setFindText((event.target as HTMLInputElement).value)}
                placeholder={useRegex ? 'Enter regex pattern...' : 'Enter text to find...'}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="replace-text" className="text-sm font-medium">
                Replace With
              </label>
              <Input
                id="replace-text"
                value={replaceText}
                onChange={(event) => setReplaceText((event.target as HTMLInputElement).value)}
                placeholder={useRegex ? 'Replacement text, supports $1...' : 'Replacement text...'}
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Checkbox
              checked={caseSensitive}
              onCheckedChange={setCaseSensitive}
              label="Case sensitive"
            />
            <Checkbox checked={wholeWord} onCheckedChange={setWholeWord} label="Whole word" />
            <Checkbox checked={useRegex} onCheckedChange={setUseRegex} label="Use regex" />
            <Checkbox checked={replaceAll} onCheckedChange={setReplaceAll} label="Replace all" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Matches: {result.error ? 0 : result.matches.length.toLocaleString()}
            </Badge>
            <Badge variant="outline">
              Replacements: {result.error ? 0 : replacementsPlanned.toLocaleString()}
            </Badge>
            <Badge variant="outline">
              Output chars: {result.output.length.toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input Text</CardTitle>
          <CardDescription>Paste the source text you want to search and replace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(event) => setInput((event.target as HTMLTextAreaElement).value)}
            placeholder="Paste text here..."
            rows={12}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      {result.error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <strong>Error:</strong> {result.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Match Preview
          </CardTitle>
          <CardDescription>
            {findText
              ? result.matches.length > 0
                ? 'Matched text is highlighted below.'
                : 'No matches found in the current input.'
              : 'Enter a search value to highlight matches.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[180px] whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-mono text-sm break-words">
            {highlightedSegments.map((segment, index) => (
              <span
                key={`${segment.text}-${index}`}
                className={segment.isMatch ? 'rounded bg-yellow-300/70 px-0.5 text-black' : ''}
              >
                {segment.text}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Replace className="h-5 w-5" />
            Result
          </CardTitle>
          <CardDescription>Preview the replaced text before copying or applying it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={result.output}
            readOnly
            rows={12}
            className="font-mono text-sm"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleCopy}
              disabled={!result.output}
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
                  Copy Result
                </>
              )}
            </Button>
            <Button
              onClick={handleApply}
              disabled={!!result.error || !findText || input === result.output}
              size="sm"
              className="min-h-11 sm:min-h-9"
            >
              <Replace className="mr-2 h-4 w-4" />
              Apply to Input
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="min-h-11 sm:min-h-9"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
