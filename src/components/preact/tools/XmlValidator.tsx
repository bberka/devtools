import { useState } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/preact/ui/card';
import { Button } from '@/components/preact/ui/button';
import { Textarea } from '@/components/preact/ui/textarea';
import { CheckCircle, XCircle, FileCode, Trash2 } from 'lucide-preact';

interface ValidationResult {
  valid: boolean;
  message: string;
  line?: number;
  column?: number;
}

export function XmlValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateXml = (text: string): ValidationResult => {
    if (!text.trim()) {
      return {
        valid: false,
        message: 'Please enter XML to validate',
      };
    }

    try {
      // Basic XML validation using regex patterns
      const trimmed = text.trim();

      // Check for XML declaration (optional)
      const xmlDeclRegex = /^<\?xml\s+version="[^"]+"\s*(?:encoding="[^"]+")?\s*\?>/;
      let content = trimmed;
      if (xmlDeclRegex.test(trimmed)) {
        content = trimmed.replace(xmlDeclRegex, '').trim();
      }

      // Check for root element
      if (!content.startsWith('<')) {
        return {
          valid: false,
          message: 'XML must start with a root element',
        };
      }

      // Check for balanced tags
      const tagStack: string[] = [];
      const tagRegex = /<\/?([a-zA-Z][\w:.-]*)/g;
      let match;

      while ((match = tagRegex.exec(content)) !== null) {
        const tagName = match[1];
        const fullTag = match[0];

        // Self-closing tag
        if (content[match.index + fullTag.length] === '/' || fullTag.startsWith('<?') || fullTag.startsWith('<!')) {
          continue;
        }

        // Closing tag
        if (fullTag.startsWith('</')) {
          if (tagStack.length === 0) {
            return {
              valid: false,
              message: `Unexpected closing tag: </${tagName}>`,
            };
          }
          const expectedTag = tagStack.pop();
          if (expectedTag !== tagName) {
            return {
              valid: false,
              message: `Mismatched closing tag: expected </${expectedTag}>, found </${tagName}>`,
            };
          }
        }
        // Opening tag
        else {
          tagStack.push(tagName);
        }
      }

      if (tagStack.length > 0) {
        return {
          valid: false,
          message: `Unclosed tag: <${tagStack[tagStack.length - 1]}>`,
        };
      }

      // Check for invalid characters in tag names
      const invalidTagRegex = /<([^a-zA-Z!?])/;
      const invalidMatch = content.match(invalidTagRegex);
      if (invalidMatch) {
        return {
          valid: false,
          message: `Invalid tag name starting with: ${invalidMatch[1]}`,
        };
      }

      // Check for unclosed attributes
      const unclosedAttrRegex = /<[^>]*\s+[a-zA-Z]+=["'][^"']*$/;
      if (unclosedAttrRegex.test(content)) {
        return {
          valid: false,
          message: 'Unclosed attribute value',
        };
      }

      return {
        valid: true,
        message: 'XML is valid',
      };
    } catch (e) {
      return {
        valid: false,
        message: e instanceof Error ? e.message : 'Unknown validation error',
      };
    }
  };

  const handleValidate = () => {
    const validationResult = validateXml(input);
    setResult(validationResult);
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            XML Input
          </CardTitle>
          <CardDescription>Paste your XML to validate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onInput={(e) => {
              setInput((e.target as HTMLTextAreaElement).value);
              setResult(null);
            }}
            placeholder='<?xml version="1.0"?>
<root>
  <item>value</item>
</root>'
            rows={12}
            className="font-mono text-sm"
          />

          <div className="flex gap-2">
            <Button onClick={handleValidate} disabled={!input.trim()}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate
            </Button>

            <Button onClick={handleClear} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-500">Valid XML</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-destructive">Invalid XML</span>
                </>
              )}
            </CardTitle>
            <CardDescription>Validation result</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`px-4 py-3 rounded-md ${
                result.valid
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              <p className="font-medium">{result.message}</p>
              {result.line && result.column && (
                <p className="text-sm mt-1">
                  Line {result.line}, Column {result.column}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
