'use client';

import { useState } from 'react';
import { Check, Copy, Database, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCopyToClipboard } from '@/hooks';

type SqlDialect =
  | 'sql'
  | 'bigquery'
  | 'clickhouse'
  | 'db2'
  | 'db2i'
  | 'duckdb'
  | 'hive'
  | 'mariadb'
  | 'mysql'
  | 'n1ql'
  | 'plsql'
  | 'postgresql'
  | 'redshift'
  | 'singlestoredb'
  | 'snowflake'
  | 'spark'
  | 'sqlite'
  | 'tidb'
  | 'transactsql'
  | 'trino';

type KeywordCase = 'preserve' | 'upper' | 'lower';
type LogicalOperatorNewline = 'before' | 'after';

const DIALECT_OPTIONS: Array<{ value: SqlDialect; label: string }> = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'transactsql', label: 'SQL Server (T-SQL)' },
  { value: 'plsql', label: 'Oracle PL/SQL' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'redshift', label: 'Amazon Redshift' },
  { value: 'spark', label: 'Apache Spark SQL' },
  { value: 'trino', label: 'Trino / Presto' },
  { value: 'clickhouse', label: 'ClickHouse' },
  { value: 'duckdb', label: 'DuckDB' },
  { value: 'db2', label: 'IBM DB2' },
  { value: 'db2i', label: 'IBM DB2 i' },
  { value: 'hive', label: 'Apache Hive' },
  { value: 'n1ql', label: 'Couchbase N1QL' },
  { value: 'singlestoredb', label: 'SingleStoreDB' },
  { value: 'tidb', label: 'TiDB' },
];

const CASE_OPTIONS: Array<{ value: KeywordCase; label: string }> = [
  { value: 'preserve', label: 'Preserve' },
  { value: 'upper', label: 'UPPERCASE' },
  { value: 'lower', label: 'lowercase' },
];

const LOGICAL_OPERATOR_OPTIONS: Array<{
  value: LogicalOperatorNewline;
  label: string;
}> = [
  { value: 'before', label: 'Before operator' },
  { value: 'after', label: 'After operator' },
];

let formatterPromise: Promise<typeof import('sql-formatter')> | null = null;

function loadFormatter() {
  formatterPromise ??= import('sql-formatter');
  return formatterPromise;
}

export function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [dialect, setDialect] = useState<SqlDialect>('sql');
  const [indentation, setIndentation] = useState('2');
  const [keywordCase, setKeywordCase] = useState<KeywordCase>('upper');
  const [logicalOperatorNewline, setLogicalOperatorNewline] =
    useState<LogicalOperatorNewline>('before');
  const copy = useCopyToClipboard();

  const formatSql = async (
    text: string,
    nextDialect = dialect,
    nextIndentation = indentation,
    nextKeywordCase = keywordCase,
    nextLogicalOperatorNewline = logicalOperatorNewline
  ) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      const { format } = await loadFormatter();
      const useTabs = nextIndentation === 'tab';
      const tabWidth = useTabs ? 2 : Number(nextIndentation);

      const formatted = format(text, {
        language: nextDialect,
        tabWidth,
        useTabs,
        keywordCase: nextKeywordCase,
        logicalOperatorNewline: nextLogicalOperatorNewline,
      });

      setOutput(formatted);
      setError('');
    } catch (formatError) {
      setOutput('');
      setError(
        formatError instanceof Error ? formatError.message : 'Error formatting SQL.'
      );
    }
  };

  const minifySql = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    const minified = input
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/,\s+/g, ', ')
      .replace(/\s*;\s*/g, '; ')
      .trim();

    setOutput(minified);
    setError('');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Input SQL
          </CardTitle>
          <CardDescription>
            Format SQL with a selectable database dialect and keyword style.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(event) => {
              const newValue = (event.target as HTMLTextAreaElement).value;
              setInput(newValue);
              void formatSql(newValue);
            }}
            placeholder="SELECT * FROM users WHERE id = 1"
            rows={10}
            className="font-mono text-sm"
          />

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">SQL dialect</label>
              <Select
                value={dialect}
                onValueChange={(value) => {
                  const nextDialect = value as SqlDialect;
                  setDialect(nextDialect);
                  if (input.trim()) {
                    void formatSql(
                      input,
                      nextDialect,
                      indentation,
                      keywordCase,
                      logicalOperatorNewline
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose dialect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {DIALECT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Indentation</label>
              <Select
                value={indentation}
                onValueChange={(value) => {
                  setIndentation(value);
                  if (input.trim()) {
                    void formatSql(
                      input,
                      dialect,
                      value,
                      keywordCase,
                      logicalOperatorNewline
                    );
                  }
                }}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Keyword case</label>
              <Select
                value={keywordCase}
                onValueChange={(value) => {
                  const nextKeywordCase = value as KeywordCase;
                  setKeywordCase(nextKeywordCase);
                  if (input.trim()) {
                    void formatSql(
                      input,
                      dialect,
                      indentation,
                      nextKeywordCase,
                      logicalOperatorNewline
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Keyword case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CASE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">AND / OR wrapping</label>
              <Select
                value={logicalOperatorNewline}
                onValueChange={(value) => {
                  const nextLogicalOperatorNewline = value as LogicalOperatorNewline;
                  setLogicalOperatorNewline(nextLogicalOperatorNewline);
                  if (input.trim()) {
                    void formatSql(
                      input,
                      dialect,
                      indentation,
                      keywordCase,
                      nextLogicalOperatorNewline
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Operator wrapping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {LOGICAL_OPERATOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button onClick={minifySql} variant="outline" size="sm" className="min-h-11 sm:min-h-9">
              Minify
            </Button>

            <Button onClick={handleClear} variant="outline" size="sm" className="min-h-11 sm:min-h-9">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <strong>Error:</strong> {error}
            </div>
          )}
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
            onClick={() => copy.copyToClipboard(output)}
            disabled={!output}
            size="sm"
            variant={copy.isCopied ? 'default' : 'outline'}
            className="min-h-11 w-full sm:min-h-9 sm:w-auto"
          >
            {copy.isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
