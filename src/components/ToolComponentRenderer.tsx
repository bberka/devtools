'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useRecentTools } from '@/lib/contexts/RecentToolsContext';

const TOOL_COMPONENTS = {
  'markdown-to-pdf': dynamic(
    () => import('@/components/tools/MarkdownConverter').then((m) => m.MarkdownConverter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'image-converter': dynamic(
    () => import('@/components/tools/ImageConverter').then((m) => m.ImageConverter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'base64-converter': dynamic(
    () => import('@/components/tools/Base64Converter').then((m) => m.Base64Converter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'number-base-converter': dynamic(
    () =>
      import('@/components/tools/NumberBaseConverter').then((m) => m.NumberBaseConverter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'json-yaml-xml': dynamic(
    () =>
      import('@/components/tools/JsonYamlXmlConverter').then((m) => m.JsonYamlXmlConverter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'timestamp-converter': dynamic(
    () => import('@/components/tools/TimestampConverter').then((m) => m.TimestampConverter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'url-encoder': dynamic(
    () => import('@/components/tools/UrlEncoder').then((m) => m.UrlEncoder),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'html-encoder': dynamic(
    () => import('@/components/tools/HtmlEncoder').then((m) => m.HtmlEncoder),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'color-converter': dynamic(
    () => import('@/components/tools/ColorConverter').then((m) => m.ColorConverter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'case-converter': dynamic(
    () => import('@/components/tools/CaseConverter').then((m) => m.CaseConverter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'jwt-decoder': dynamic(
    () => import('@/components/tools/JwtDecoder').then((m) => m.JwtDecoder),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'text-escape': dynamic(
    () => import('@/components/tools/TextEscape').then((m) => m.TextEscape),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'hash-generator': dynamic(
    () => import('@/components/tools/HashGenerator').then((m) => m.HashGenerator),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'uuid-generator': dynamic(
    () => import('@/components/tools/UuidGenerator').then((m) => m.UuidGenerator),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'password-generator': dynamic(
    () => import('@/components/tools/PasswordGenerator').then((m) => m.PasswordGenerator),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'lorem-ipsum': dynamic(
    () => import('@/components/tools/LoremIpsumGenerator').then((m) => m.LoremIpsumGenerator),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'sql-formatter': dynamic(
    () => import('@/components/tools/SqlFormatter').then((m) => m.SqlFormatter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'json-formatter': dynamic(
    () => import('@/components/tools/JsonFormatter').then((m) => m.JsonFormatter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'xml-formatter': dynamic(
    () => import('@/components/tools/XmlFormatter').then((m) => m.XmlFormatter),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'xml-validator': dynamic(
    () => import('@/components/tools/XmlValidator').then((m) => m.XmlValidator),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'markdown-preview': dynamic(
    () =>
      import('@/components/tools/MarkdownPreviewer').then((m) => m.MarkdownPreviewer),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'text-diff': dynamic(
    () => import('@/components/tools/TextDiff').then((m) => m.TextDiff),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'regex-tester': dynamic(
    () => import('@/components/tools/RegexTester').then((m) => m.RegexTester),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'cron-parser': dynamic(
    () => import('@/components/tools/CronParser').then((m) => m.CronParser),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'rsa-key-generator': dynamic(
    () => import('@/components/tools/RsaKeyGenerator').then((m) => m.RsaKeyGenerator),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'aes-encryption': dynamic(
    () => import('@/components/tools/AesEncryption').then((m) => m.AesEncryption),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'bcrypt-hasher': dynamic(
    () => import('@/components/tools/BcryptHasher').then((m) => m.BcryptHasher),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'ip-lookup': dynamic(
    () => import('@/components/tools/IpLookup').then((m) => m.IpLookup),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'dns-lookup': dynamic(
    () => import('@/components/tools/DnsLookup').then((m) => m.DnsLookup),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'subnet-calculator': dynamic(
    () => import('@/components/tools/SubnetCalculator').then((m) => m.SubnetCalculator),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'port-checker': dynamic(
    () => import('@/components/tools/PortChecker').then((m) => m.PortChecker),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'svg-path-editor': dynamic(
    () => import('@/components/tools/SvgPathEditor').then((m) => m.SvgPathEditor),
    { ssr: false, loading: () => <LoadingState /> }
  ),
  'color-contrast-checker': dynamic(
    () =>
      import('@/components/tools/ColorContrastChecker').then((m) => m.ColorContrastChecker),
    { ssr: false, loading: () => <LoadingState /> }
  ),
} as const;

export function ToolComponentRenderer({ toolId }: { toolId: string }) {
  const { addRecentTool } = useRecentTools();
  const lastTrackedToolIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedToolIdRef.current === toolId) {
      return;
    }

    lastTrackedToolIdRef.current = toolId;
    addRecentTool(toolId);
  }, [addRecentTool, toolId]);

  const Component = TOOL_COMPONENTS[toolId as keyof typeof TOOL_COMPONENTS];

  if (!Component) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        This tool has not been wired into the Next.js renderer yet.
      </div>
    );
  }

  return <Component />;
}

function LoadingState() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
      Loading tool...
    </div>
  );
}
