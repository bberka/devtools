import { useState } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Copy, Check } from 'lucide-preact';
import { useCopyToClipboard } from '../hooks';

type GenerateType = 'paragraphs' | 'sentences' | 'words';

const typeOptions = [
  { value: 'paragraphs', label: 'Paragraphs' },
  { value: 'sentences', label: 'Sentences' },
  { value: 'words', label: 'Words' },
];

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

export function LoremIpsumGenerator() {
  const [type, setType] = useState<GenerateType>('paragraphs');
  const [count, setCount] = useState('3');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [htmlTags, setHtmlTags] = useState(false);
  const [output, setOutput] = useState('');
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const generateWords = (wordCount: number, start: boolean = false) => {
    const words = [];
    if (start && startWithLorem) {
      words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
      wordCount -= 5;
    }

    for (let i = 0; i < wordCount; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }

    return words.join(' ');
  };

  const generateSentences = (sentenceCount: number) => {
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      const wordCount = Math.floor(Math.random() * 10) + 5;
      const sentence = generateWords(wordCount, i === 0);
      sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
    }
    return sentences.join(' ');
  };

  const generateParagraphs = (paragraphCount: number) => {
    const paragraphs = [];
    for (let i = 0; i < paragraphCount; i++) {
      const sentenceCount = Math.floor(Math.random() * 5) + 3;
      paragraphs.push(generateSentences(sentenceCount));
    }
    return paragraphs;
  };

  const handleGenerate = () => {
    const numCount = parseInt(count) || 1;
    let result = '';

    if (type === 'words') {
      result = generateWords(numCount, true);
    } else if (type === 'sentences') {
      result = generateSentences(numCount);
    } else {
      const paragraphs = generateParagraphs(numCount);
      if (htmlTags) {
        result = paragraphs.map(p => `<p>${p}</p>`).join('\n\n');
      } else {
        result = paragraphs.join('\n\n');
      }
    }

    setOutput(result);
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <Select
              options={typeOptions}
              value={type}
              onChange={(e) => setType((e.target as HTMLSelectElement).value as GenerateType)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Count</label>
            <Input
              type="number"
              value={count}
              onInput={(e) => setCount((e.target as HTMLInputElement).value)}
              min="1"
              max="100"
            />
          </div>

          <Checkbox
            checked={startWithLorem}
            onChange={setStartWithLorem}
            label='Start with "Lorem ipsum..."'
          />

          {type === 'paragraphs' && (
            <Checkbox
              checked={htmlTags}
              onChange={setHtmlTags}
              label="Wrap in HTML <p> tags"
            />
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button onClick={handleGenerate} className="w-full">
        Generate
      </Button>

      {/* Output */}
      {output && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Output</CardTitle>
            <Button
              variant={isCopied ? "default" : "ghost"}
              size="icon"
              onClick={handleCopy}
              title={isCopied ? "Copied!" : "Copy output"}
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="w-full min-h-[200px] p-3 rounded-md bg-muted text-sm overflow-x-auto whitespace-pre-wrap">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
