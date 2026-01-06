import { useState, useEffect } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Input } from '@/components/preact/ui/input';
import { Textarea } from '@/components/preact/ui/textarea';
import { Checkbox } from '@/components/preact/ui/checkbox';
import { SearchCode, AlertCircle } from 'lucide-preact';

interface Match {
  text: string;
  index: number;
  groups: string[];
}

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({
    global: true,
    multiline: false,
    caseInsensitive: false,
    dotAll: false,
    unicode: false,
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    testRegex();
  }, [pattern, testString, flags]);

  const testRegex = () => {
    if (!pattern) {
      setMatches([]);
      setError('');
      setIsValid(false);
      return;
    }

    try {
      let flagString = '';
      if (flags.global) flagString += 'g';
      if (flags.multiline) flagString += 'm';
      if (flags.caseInsensitive) flagString += 'i';
      if (flags.dotAll) flagString += 's';
      if (flags.unicode) flagString += 'u';

      const regex = new RegExp(pattern, flagString);
      setIsValid(true);
      setError('');

      if (!testString) {
        setMatches([]);
        return;
      }

      const foundMatches: Match[] = [];

      if (flags.global) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          // Prevent infinite loop for zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(foundMatches);
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : 'Invalid regular expression');
      setMatches([]);
    }
  };

  const getHighlightedText = () => {
    if (!testString || matches.length === 0) {
      return testString;
    }

    const parts: { text: string; isMatch: boolean }[] = [];
    let lastIndex = 0;

    matches.forEach((match) => {
      if (match.index > lastIndex) {
        parts.push({
          text: testString.slice(lastIndex, match.index),
          isMatch: false,
        });
      }
      parts.push({
        text: match.text,
        isMatch: true,
      });
      lastIndex = match.index + match.text.length;
    });

    if (lastIndex < testString.length) {
      parts.push({
        text: testString.slice(lastIndex),
        isMatch: false,
      });
    }

    return parts;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchCode className="h-5 w-5" />
            Regular Expression
          </CardTitle>
          <CardDescription>Enter your regex pattern</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono text-muted-foreground">/</span>
              <Input
                value={pattern}
                onInput={(e) => setPattern((e.target as HTMLInputElement).value)}
                placeholder="Enter regex pattern..."
                className={`font-mono flex-1 ${
                  pattern && !isValid ? 'border-destructive' : pattern && isValid ? 'border-green-500' : ''
                }`}
              />
              <span className="text-2xl font-mono text-muted-foreground">/</span>
              <span className="font-mono text-sm text-muted-foreground min-w-[60px]">
                {flags.global ? 'g' : ''}
                {flags.multiline ? 'm' : ''}
                {flags.caseInsensitive ? 'i' : ''}
                {flags.dotAll ? 's' : ''}
                {flags.unicode ? 'u' : ''}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm font-medium">Flags:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={flags.global}
                  onCheckedChange={(checked) =>
                    setFlags({ ...flags, global: checked as boolean })
                  }
                />
                <span className="text-sm">
                  Global (<code className="font-mono">g</code>)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={flags.caseInsensitive}
                  onCheckedChange={(checked) =>
                    setFlags({ ...flags, caseInsensitive: checked as boolean })
                  }
                />
                <span className="text-sm">
                  Case Insensitive (<code className="font-mono">i</code>)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={flags.multiline}
                  onCheckedChange={(checked) =>
                    setFlags({ ...flags, multiline: checked as boolean })
                  }
                />
                <span className="text-sm">
                  Multiline (<code className="font-mono">m</code>)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={flags.dotAll}
                  onCheckedChange={(checked) =>
                    setFlags({ ...flags, dotAll: checked as boolean })
                  }
                />
                <span className="text-sm">
                  Dot All (<code className="font-mono">s</code>)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={flags.unicode}
                  onCheckedChange={(checked) =>
                    setFlags({ ...flags, unicode: checked as boolean })
                  }
                />
                <span className="text-sm">
                  Unicode (<code className="font-mono">u</code>)
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test String</CardTitle>
          <CardDescription>Enter text to test against the regex</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={testString}
            onInput={(e) => setTestString((e.target as HTMLTextAreaElement).value)}
            placeholder="Enter test string..."
            rows={8}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      {testString && pattern && isValid && (
        <Card>
          <CardHeader>
            <CardTitle>
              Matches ({matches.length})
            </CardTitle>
            <CardDescription>
              {matches.length === 0 ? 'No matches found' : `Found ${matches.length} match${matches.length === 1 ? '' : 'es'}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap break-words">
              {getHighlightedText() === testString
                ? testString
                : getHighlightedText().map((part, idx) =>
                    typeof part === 'string' ? (
                      part
                    ) : (
                      <span
                        key={idx}
                        className={part.isMatch ? 'bg-yellow-300 dark:bg-yellow-600' : ''}
                      >
                        {part.text}
                      </span>
                    )
                  )}
            </div>

            {matches.length > 0 && (
              <div className="space-y-3">
                {matches.map((match, idx) => (
                  <div key={idx} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Match {idx + 1}</span>
                      <span className="text-xs text-muted-foreground">Index: {match.index}</span>
                    </div>
                    <div className="bg-muted p-2 rounded font-mono text-sm break-all">
                      {match.text}
                    </div>
                    {match.groups.length > 0 && match.groups.some((g) => g !== undefined) && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          Capture Groups:
                        </div>
                        {match.groups.map((group, groupIdx) =>
                          group !== undefined ? (
                            <div key={groupIdx} className="text-xs pl-4">
                              <span className="text-muted-foreground">Group {groupIdx + 1}:</span>{' '}
                              <code className="bg-muted px-1 py-0.5 rounded">{group}</code>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
