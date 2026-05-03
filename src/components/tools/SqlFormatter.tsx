'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Database, Trash2 } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks';

export function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentation, setIndentation] = useState('2');
  const [uppercase, setUppercase] = useState(true);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const SQL_KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
    'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO',
    'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP',
    'INDEX', 'VIEW', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'AS', 'CASE',
    'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'ALL', 'DISTINCT', 'ASC', 'DESC',
  ];

  const formatSql = (text: string) => {
    if (!text.trim()) {
      setOutput('');
      return;
    }

    try {
      let formatted = text.trim();
      const spaces = indentation === 'tab' ? '\t' : ' '.repeat(parseInt(indentation));

      // Normalize whitespace
      formatted = formatted.replace(/\s+/g, ' ');

      // Add newlines before major keywords
      const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN',
                             'RIGHT JOIN', 'FULL JOIN', 'ORDER BY', 'GROUP BY', 'HAVING',
                             'LIMIT', 'UNION', 'INSERT INTO', 'UPDATE', 'DELETE FROM',
                             'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE'];

      majorKeywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${keyword}`);
      });

      // Add newlines and indentation for AND/OR in WHERE clauses
      formatted = formatted.replace(/\b(AND|OR)\b/gi, '\n' + spaces + '$1');

      // Add newlines for CASE statements
      formatted = formatted.replace(/\b(WHEN|THEN|ELSE)\b/gi, '\n' + spaces + '$1');
      formatted = formatted.replace(/\bEND\b/gi, '\nEND');

      // Handle commas in SELECT
      formatted = formatted.replace(/,(?=(?:[^']*'[^']*')*[^']*$)/g, ',\n' + spaces);

      // Clean up extra newlines
      formatted = formatted.replace(/\n\s*\n/g, '\n');

      // Apply uppercase if enabled
      if (uppercase) {
        SQL_KEYWORDS.forEach((keyword) => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          formatted = formatted.replace(regex, keyword);
        });
      }

      // Trim each line
      formatted = formatted
        .split('\n')
        .map((line) => line.trim())
        .join('\n');

      setOutput(formatted);
    } catch (e) {
      setOutput('Error formatting SQL');
    }
  };

  const minifySql = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    const minified = input
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/,\s+/g, ',')
      .trim();

    setOutput(minified);
  };


  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Input SQL
          </CardTitle>
          <CardDescription>Paste your SQL query here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => {
              const newValue = (e.target as HTMLTextAreaElement).value;
              setInput(newValue);
              formatSql(newValue);
            }}
            placeholder="SELECT * FROM users WHERE id = 1"
            rows={10}
            className="font-mono text-sm"
          />

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor="indentation" className="text-sm font-medium">
                Indentation:
              </label>
              <Select
                value={indentation}
                onValueChange={(value) => {
                  setIndentation(value);
                  if (input.trim()) {
                    formatSql(input);
                  }
                }}
              >
                <SelectTrigger id="indentation" className="w-[140px]">
                  <SelectValue placeholder="Indentation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="8">8 spaces</SelectItem>
                    <SelectItem value="tab">Tab</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="uppercase"
                checked={uppercase}
                onChange={(e) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  setUppercase(checked);
                  if (input.trim()) {
                    formatSql(input);
                  }
                }}
                className="h-4 w-4"
              />
              <label htmlFor="uppercase" className="text-sm font-medium">
                Uppercase Keywords
              </label>
            </div>

            <Button onClick={minifySql} variant="outline" size="sm">
              Minify
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
          <CardTitle>Formatted Output</CardTitle>
          <CardDescription>
            {output ? `${output.split('\n').length} lines` : 'Output will appear here'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={output}
            readOnly
            placeholder="Formatted SQL will appear here..."
            rows={10}
            className="font-mono text-sm"
          />

          <Button
            onClick={() => copyToClipboard(output)}
            disabled={!output}
            size="sm"
            variant={isCopied ? "default" : "outline"}
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
