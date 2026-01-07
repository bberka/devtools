import { useState } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Copy, Check, Server, Loader2, Search } from 'lucide-preact';
import { useCopyToClipboard, useActionButton } from '../hooks';

type RecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME' | 'SOA';

interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question?: Array<{ name: string; type: number }>;
  Answer?: DnsRecord[];
  Authority?: DnsRecord[];
}

export function DnsLookup() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState<RecordType>('A');
  const [dnsResponse, setDnsResponse] = useState<DnsResponse | null>(null);
  const [error, setError] = useState('');

  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { executeAction: executeLookup, isLoading } = useActionButton();

  const recordTypes: RecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];

  const recordTypeMap: Record<RecordType, number> = {
    A: 1,
    AAAA: 28,
    MX: 15,
    TXT: 16,
    NS: 2,
    CNAME: 5,
    SOA: 6,
  };

  const isValidDomain = (domain: string): boolean => {
    const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainPattern.test(domain);
  };

  const lookupDNS = async () => {
    setError('');
    setDnsResponse(null);

    const domainToLookup = domain.trim();

    if (!domainToLookup) {
      setError('Please enter a domain name');
      return;
    }

    if (!isValidDomain(domainToLookup)) {
      setError('Invalid domain name format');
      return;
    }

    try {
      // Using Google's DNS-over-HTTPS API
      const typeNum = recordTypeMap[recordType];
      const url = `https://dns.google/resolve?name=${encodeURIComponent(domainToLookup)}&type=${typeNum}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to query DNS records');
      }

      const data: DnsResponse = await response.json();

      if (data.Status !== 0) {
        setError(`DNS query failed with status: ${data.Status}`);
        return;
      }

      if (!data.Answer || data.Answer.length === 0) {
        setError(`No ${recordType} records found for ${domainToLookup}`);
        return;
      }

      setDnsResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup DNS records');
    }
  };

  const handleLookup = async () => {
    await executeLookup(lookupDNS);
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
  };

  const handleClear = () => {
    setDomain('');
    setDnsResponse(null);
    setError('');
  };

  const formatTTL = (ttl: number): string => {
    if (ttl < 60) return `${ttl}s`;
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m`;
    if (ttl < 86400) return `${Math.floor(ttl / 3600)}h`;
    return `${Math.floor(ttl / 86400)}d`;
  };

  const copyAllRecords = () => {
    if (!dnsResponse?.Answer) return;
    const text = dnsResponse.Answer.map(r => r.data).join('\n');
    handleCopy(text);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            DNS Records Lookup
          </CardTitle>
          <CardDescription>
            Query DNS records for any domain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              value={domain}
              onInput={(e) => setDomain((e.target as HTMLInputElement).value)}
              placeholder="e.g., google.com"
              className="flex-1 font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleLookup();
                }
              }}
            />
            <select
              className="flex h-10 w-full sm:w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={recordType}
              onChange={(e) => setRecordType((e.target as HTMLSelectElement).value as RecordType)}
              aria-label="Record Type"
            >
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleLookup} disabled={isLoading || !domain}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Looking up...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Lookup DNS
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {dnsResponse?.Answer && dnsResponse.Answer.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>DNS Records</CardTitle>
              <CardDescription>
                Found {dnsResponse.Answer.length} {recordType} record{dnsResponse.Answer.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyAllRecords}
              title="Copy all records"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dnsResponse.Answer.map((record, index) => (
                <div
                  key={index}
                  className="p-3 rounded-md bg-muted border border-input space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          TTL: {formatTTL(record.TTL)}
                        </span>
                      </div>
                      <code className="block p-2 rounded bg-background font-mono text-sm break-all">
                        {record.data}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(record.data)}
                      title="Copy record"
                      className="shrink-0"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {record.name && record.name !== domain && (
                    <div className="text-xs text-muted-foreground">
                      Name: {record.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Record Type Information */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-500">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-sm space-y-2">
              <p className="font-medium">DNS Record Types</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>A</strong> - IPv4 address records</li>
                <li><strong>AAAA</strong> - IPv6 address records</li>
                <li><strong>MX</strong> - Mail exchange servers</li>
                <li><strong>TXT</strong> - Text records (SPF, DKIM, etc.)</li>
                <li><strong>NS</strong> - Nameserver records</li>
                <li><strong>CNAME</strong> - Canonical name (alias) records</li>
                <li><strong>SOA</strong> - Start of authority records</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Uses Google DNS-over-HTTPS for secure queries
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
