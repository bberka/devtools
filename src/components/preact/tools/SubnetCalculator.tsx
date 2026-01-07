import { useState, useEffect } from 'preact/hooks';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Copy, Check, Network, Calculator } from 'lucide-preact';
import { useCopyToClipboard } from '../hooks';

interface SubnetInfo {
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIP: string;
  lastUsableIP: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  ipType: string;
  binarySubnetMask: string;
}

export function SubnetCalculator() {
  const [ipInput, setIpInput] = useState('');
  const [cidrInput, setCidrInput] = useState('24');
  const [subnetInfo, setSubnetInfo] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { copyToClipboard } = useCopyToClipboard();

  const ipToNumber = (ip: string): number => {
    const parts = ip.split('.');
    return parts.reduce((acc, part, i) => acc + parseInt(part, 10) * Math.pow(256, 3 - i), 0);
  };

  const numberToIp = (num: number): string => {
    return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff].join('.');
  };

  const cidrToMask = (cidr: number): string => {
    const mask = (0xffffffff << (32 - cidr)) >>> 0;
    return numberToIp(mask);
  };

  const getWildcardMask = (mask: string): string => {
    const maskNum = ipToNumber(mask);
    const wildcardNum = ~maskNum >>> 0;
    return numberToIp(wildcardNum);
  };

  const ipToBinary = (ip: string): string => {
    return ip
      .split('.')
      .map((octet) => parseInt(octet, 10).toString(2).padStart(8, '0'))
      .join('.');
  };

  const getIpClass = (firstOctet: number): string => {
    if (firstOctet >= 1 && firstOctet <= 126) return 'A';
    if (firstOctet >= 128 && firstOctet <= 191) return 'B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'C';
    if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
    if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)';
    return 'Unknown';
  };

  const getIpType = (ip: string): string => {
    const parts = ip.split('.').map(Number);
    const firstOctet = parts[0];

    if (ip === '0.0.0.0') return 'Current network';
    if (ip === '255.255.255.255') return 'Broadcast';
    if (firstOctet === 10) return 'Private (Class A)';
    if (firstOctet === 172 && parts[1] >= 16 && parts[1] <= 31) return 'Private (Class B)';
    if (firstOctet === 192 && parts[1] === 168) return 'Private (Class C)';
    if (firstOctet === 127) return 'Loopback';
    if (firstOctet === 169 && parts[1] === 254) return 'APIPA (Link-local)';
    if (firstOctet >= 224 && firstOctet <= 239) return 'Multicast';
    return 'Public';
  };

  const isValidIPv4 = (ip: string): boolean => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  };

  const calculateSubnet = () => {
    setError('');
    setSubnetInfo(null);

    const ip = ipInput.trim();
    const cidr = parseInt(cidrInput, 10);

    if (!ip) {
      setError('Please enter an IP address');
      return;
    }

    if (!isValidIPv4(ip)) {
      setError('Invalid IPv4 address format');
      return;
    }

    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      setError('CIDR must be between 0 and 32');
      return;
    }

    try {
      const ipNum = ipToNumber(ip);
      const subnetMask = cidrToMask(cidr);
      const maskNum = ipToNumber(subnetMask);

      const networkNum = (ipNum & maskNum) >>> 0;
      const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;

      const networkAddress = numberToIp(networkNum);
      const broadcastAddress = numberToIp(broadcastNum);
      const firstUsableIP = numberToIp(networkNum + 1);
      const lastUsableIP = numberToIp(broadcastNum - 1);

      const totalHosts = Math.pow(2, 32 - cidr);
      const usableHosts = cidr === 32 ? 1 : cidr === 31 ? 2 : totalHosts - 2;

      const firstOctet = parseInt(ip.split('.')[0], 10);
      const ipClass = getIpClass(firstOctet);
      const ipType = getIpType(ip);

      setSubnetInfo({
        ipAddress: ip,
        cidr,
        subnetMask,
        wildcardMask: getWildcardMask(subnetMask),
        networkAddress,
        broadcastAddress,
        firstUsableIP,
        lastUsableIP,
        totalHosts,
        usableHosts,
        ipClass,
        ipType,
        binarySubnetMask: ipToBinary(subnetMask),
      });
    } catch (err) {
      setError('Failed to calculate subnet information');
    }
  };

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await copyToClipboard(text);
      setCopiedField(fieldId);
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleClear = () => {
    setIpInput('');
    setCidrInput('24');
    setSubnetInfo(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Subnet Calculator
          </CardTitle>
          <CardDescription>
            Calculate subnet information from IP address and CIDR notation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              value={ipInput}
              onInput={(e) => setIpInput((e.target as HTMLInputElement).value)}
              placeholder="e.g., 192.168.1.1"
              className="flex-1 font-mono"
            />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <Input
                type="number"
                value={cidrInput}
                onInput={(e) => setCidrInput((e.target as HTMLInputElement).value)}
                placeholder="24"
                min="0"
                max="32"
                className="w-20 font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={calculateSubnet} disabled={!ipInput}>
          <Calculator className="h-4 w-4 mr-2" />
          Calculate
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
      {subnetInfo && (
        <div className="space-y-4">
          {/* Network Information */}
          <Card>
            <CardHeader>
              <CardTitle>Network Information</CardTitle>
              <CardDescription>IP and subnet details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* IP Address */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm">
                      {subnetInfo.ipAddress}/{subnetInfo.cidr}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(`${subnetInfo.ipAddress}/${subnetInfo.cidr}`, 'ip-cidr')}
                      title="Copy IP/CIDR"
                    >
                      {copiedField === 'ip-cidr' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Subnet Mask */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Subnet Mask</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm">
                      {subnetInfo.subnetMask}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(subnetInfo.subnetMask, 'subnet-mask')}
                      title="Copy subnet mask"
                    >
                      {copiedField === 'subnet-mask' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Wildcard Mask */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Wildcard Mask</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm">
                      {subnetInfo.wildcardMask}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(subnetInfo.wildcardMask, 'wildcard-mask')}
                      title="Copy wildcard mask"
                    >
                      {copiedField === 'wildcard-mask' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Binary Subnet Mask */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Binary Subnet Mask
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-md bg-muted font-mono text-xs break-all">
                      {subnetInfo.binarySubnetMask}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(subnetInfo.binarySubnetMask, 'binary-mask')}
                      title="Copy binary mask"
                    >
                      {copiedField === 'binary-mask' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Host Information */}
          <Card>
            <CardHeader>
              <CardTitle>Host Range</CardTitle>
              <CardDescription>Network and usable IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Network Address */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Network Address
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm">
                      {subnetInfo.networkAddress}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(subnetInfo.networkAddress, 'network-address')}
                      title="Copy network address"
                    >
                      {copiedField === 'network-address' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Broadcast Address */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Broadcast Address
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm">
                      {subnetInfo.broadcastAddress}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(subnetInfo.broadcastAddress, 'broadcast-address')}
                      title="Copy broadcast address"
                    >
                      {copiedField === 'broadcast-address' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* First Usable IP */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    First Usable IP
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm">
                      {subnetInfo.firstUsableIP}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(subnetInfo.firstUsableIP, 'first-ip')}
                      title="Copy first IP"
                    >
                      {copiedField === 'first-ip' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Last Usable IP */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Usable IP
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm">
                      {subnetInfo.lastUsableIP}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(subnetInfo.lastUsableIP, 'last-ip')}
                      title="Copy last IP"
                    >
                      {copiedField === 'last-ip' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Total Hosts */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Total Hosts</label>
                  <div className="p-2 rounded-md bg-muted text-sm font-mono">
                    {subnetInfo.totalHosts.toLocaleString()}
                  </div>
                </div>

                {/* Usable Hosts */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Usable Hosts</label>
                  <div className="p-2 rounded-md bg-muted text-sm font-mono">
                    {subnetInfo.usableHosts.toLocaleString()}
                  </div>
                </div>

                {/* IP Class */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">IP Class</label>
                  <div className="p-2 rounded-md bg-muted text-sm">{subnetInfo.ipClass}</div>
                </div>

                {/* IP Type */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">IP Type</label>
                  <div className="p-2 rounded-md bg-muted text-sm">{subnetInfo.ipType}</div>
                </div>
              </div>
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
              <p className="font-medium">About Subnetting</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>CIDR notation (e.g., /24) represents the number of network bits</li>
                <li>Common CIDR values: /8 (16.7M hosts), /16 (65K hosts), /24 (254 hosts)</li>
                <li>Network address is the first IP in the range</li>
                <li>Broadcast address is the last IP in the range</li>
                <li>Usable hosts = Total hosts - 2 (excluding network and broadcast)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
