import { useState } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Copy, Check, MapPin, Loader2, Search, Globe, Wifi } from 'lucide-preact';
import { useCopyToClipboard, useActionButton } from '../hooks';

interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string; // latitude,longitude
  org?: string; // ISP/Organization
  postal?: string;
  timezone?: string;
  hostname?: string;
  anycast?: boolean;
  bogon?: boolean;
}

export function IpLookup() {
  const [ipAddress, setIpAddress] = useState('');
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [error, setError] = useState('');

  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { executeAction: executeLookup, isLoading } = useActionButton();

  const isValidIP = (ip: string): boolean => {
    // IPv4 pattern
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

    if (ipv4Pattern.test(ip)) {
      const parts = ip.split('.');
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }

    return ipv6Pattern.test(ip);
  };

  const lookupIP = async () => {
    setError('');
    setIpInfo(null);

    const ipToLookup = ipAddress.trim();

    // If empty, lookup current IP
    if (!ipToLookup) {
      try {
        const response = await fetch('https://ipinfo.io/json');
        if (!response.ok) {
          throw new Error('Failed to fetch IP information');
        }
        const data = await response.json();
        setIpInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to lookup IP address');
      }
      return;
    }

    // Validate IP format
    if (!isValidIP(ipToLookup)) {
      setError('Invalid IP address format');
      return;
    }

    try {
      const response = await fetch(`https://ipinfo.io/${ipToLookup}/json`);
      if (!response.ok) {
        throw new Error('Failed to fetch IP information');
      }
      const data = await response.json();

      if (data.bogon) {
        setError('This is a private/reserved IP address (bogon)');
        setIpInfo(data);
        return;
      }

      setIpInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup IP address');
    }
  };

  const handleLookup = async () => {
    await executeLookup(lookupIP);
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
  };

  const handleClear = () => {
    setIpAddress('');
    setIpInfo(null);
    setError('');
  };

  const handleGetMyIP = async () => {
    setIpAddress('');
    await handleLookup();
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            IP Address Lookup
          </CardTitle>
          <CardDescription>
            Enter an IP address to lookup or leave empty to check your current IP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={ipAddress}
              onInput={(e) => setIpAddress((e.target as HTMLInputElement).value)}
              placeholder="e.g., 8.8.8.8 or leave empty for your IP"
              className="flex-1 font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleLookup();
                }
              }}
            />
            <Button onClick={handleGetMyIP} variant="outline" disabled={isLoading}>
              <Wifi className="h-4 w-4 mr-2" />
              My IP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleLookup} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Looking up...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Lookup IP
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
      {ipInfo && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IP Information</CardTitle>
              <CardDescription>Geolocation and network details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* IP Address */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm break-all">
                      {ipInfo.ip}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(ipInfo.ip)}
                      title="Copy IP"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Hostname */}
                {ipInfo.hostname && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Hostname</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm break-all">
                        {ipInfo.hostname}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(ipInfo.hostname!)}
                        title="Copy hostname"
                      >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* City */}
                {ipInfo.city && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <div className="p-2 rounded-md bg-muted text-sm">
                      {ipInfo.city}
                    </div>
                  </div>
                )}

                {/* Region */}
                {ipInfo.region && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Region</label>
                    <div className="p-2 rounded-md bg-muted text-sm">
                      {ipInfo.region}
                    </div>
                  </div>
                )}

                {/* Country */}
                {ipInfo.country && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <div className="p-2 rounded-md bg-muted text-sm">
                      {ipInfo.country}
                    </div>
                  </div>
                )}

                {/* Postal Code */}
                {ipInfo.postal && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Postal Code</label>
                    <div className="p-2 rounded-md bg-muted text-sm">
                      {ipInfo.postal}
                    </div>
                  </div>
                )}

                {/* Location (Coordinates) */}
                {ipInfo.loc && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm">
                        {ipInfo.loc}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(ipInfo.loc!)}
                        title="Copy coordinates"
                      >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Timezone */}
                {ipInfo.timezone && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                    <div className="p-2 rounded-md bg-muted text-sm">
                      {ipInfo.timezone}
                    </div>
                  </div>
                )}

                {/* Organization/ISP */}
                {ipInfo.org && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Organization (ISP)</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm break-all">
                        {ipInfo.org}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(ipInfo.org!)}
                        title="Copy organization"
                      >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Link */}
              {ipInfo.loc && (
                <div className="mt-4 pt-4 border-t">
                  <a
                    href={`https://www.google.com/maps?q=${ipInfo.loc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    View on Google Maps
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Information Card */}
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
              <p className="font-medium">About IP Lookup</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Uses ipinfo.io API for geolocation data</li>
                <li>Leave the input empty to check your current public IP</li>
                <li>Private IP addresses (10.x.x.x, 192.168.x.x, etc.) will show limited information</li>
                <li>Supports both IPv4 and IPv6 addresses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
