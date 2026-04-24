'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRecentTools } from '@/lib/contexts/RecentToolsContext';

const TOOL_COMPONENTS = {
  'markdown-to-pdf': dynamic(() =>
    import('@/components/tools/MarkdownConverter').then(
      (module) => module.MarkdownConverter
    )
  ),
  'image-converter': dynamic(() =>
    import('@/components/tools/ImageConverter').then(
      (module) => module.ImageConverter
    )
  ),
  'base64-converter': dynamic(() =>
    import('@/components/tools/Base64Converter').then(
      (module) => module.Base64Converter
    )
  ),
  'number-base-converter': dynamic(() =>
    import('@/components/tools/NumberBaseConverter').then(
      (module) => module.NumberBaseConverter
    )
  ),
  'json-yaml-xml': dynamic(() =>
    import('@/components/tools/JsonYamlXmlConverter').then(
      (module) => module.JsonYamlXmlConverter
    )
  ),
  'timestamp-converter': dynamic(() =>
    import('@/components/tools/TimestampConverter').then(
      (module) => module.TimestampConverter
    )
  ),
  'url-encoder': dynamic(() =>
    import('@/components/tools/UrlEncoder').then((module) => module.UrlEncoder)
  ),
  'html-encoder': dynamic(() =>
    import('@/components/tools/HtmlEncoder').then(
      (module) => module.HtmlEncoder
    )
  ),
  'html-converter': dynamic(() =>
    import('@/components/tools/HtmlConverter').then(
      (module) => module.HtmlConverter
    )
  ),
  'color-converter': dynamic(() =>
    import('@/components/tools/ColorConverter').then(
      (module) => module.ColorConverter
    )
  ),
  'case-converter': dynamic(() =>
    import('@/components/tools/CaseConverter').then(
      (module) => module.CaseConverter
    )
  ),
  'jwt-decoder': dynamic(() =>
    import('@/components/tools/JwtDecoder').then((module) => module.JwtDecoder)
  ),
  'text-escape': dynamic(() =>
    import('@/components/tools/TextEscape').then((module) => module.TextEscape)
  ),
  'hash-generator': dynamic(() =>
    import('@/components/tools/HashGenerator').then(
      (module) => module.HashGenerator
    )
  ),
  'uuid-generator': dynamic(() =>
    import('@/components/tools/UuidGenerator').then(
      (module) => module.UuidGenerator
    )
  ),
  'password-generator': dynamic(() =>
    import('@/components/tools/PasswordGenerator').then(
      (module) => module.PasswordGenerator
    )
  ),
  'lorem-ipsum': dynamic(() =>
    import('@/components/tools/LoremIpsumGenerator').then(
      (module) => module.LoremIpsumGenerator
    )
  ),
  'sql-formatter': dynamic(() =>
    import('@/components/tools/SqlFormatter').then(
      (module) => module.SqlFormatter
    )
  ),
  'json-formatter': dynamic(() =>
    import('@/components/tools/JsonFormatter').then(
      (module) => module.JsonFormatter
    )
  ),
  'xml-formatter': dynamic(() =>
    import('@/components/tools/XmlFormatter').then(
      (module) => module.XmlFormatter
    )
  ),
  'xml-validator': dynamic(() =>
    import('@/components/tools/XmlValidator').then(
      (module) => module.XmlValidator
    )
  ),
  'markdown-preview': dynamic(() =>
    import('@/components/tools/MarkdownPreviewer').then(
      (module) => module.MarkdownPreviewer
    )
  ),
  'text-diff': dynamic(() =>
    import('@/components/tools/TextDiff').then((module) => module.TextDiff)
  ),
  'regex-tester': dynamic(() =>
    import('@/components/tools/RegexTester').then(
      (module) => module.RegexTester
    )
  ),
  'cron-parser': dynamic(() =>
    import('@/components/tools/CronParser').then((module) => module.CronParser)
  ),
  'rsa-key-generator': dynamic(() =>
    import('@/components/tools/RsaKeyGenerator').then(
      (module) => module.RsaKeyGenerator
    )
  ),
  'aes-encryption': dynamic(() =>
    import('@/components/tools/AesEncryption').then(
      (module) => module.AesEncryption
    )
  ),
  'bcrypt-hasher': dynamic(() =>
    import('@/components/tools/BcryptHasher').then(
      (module) => module.BcryptHasher
    )
  ),
  'ip-lookup': dynamic(() =>
    import('@/components/tools/IpLookup').then((module) => module.IpLookup)
  ),
  'dns-lookup': dynamic(() =>
    import('@/components/tools/DnsLookup').then((module) => module.DnsLookup)
  ),
  'subnet-calculator': dynamic(() =>
    import('@/components/tools/SubnetCalculator').then(
      (module) => module.SubnetCalculator
    )
  ),
  'port-checker': dynamic(() =>
    import('@/components/tools/PortChecker').then(
      (module) => module.PortChecker
    )
  ),
  'svg-path-editor': dynamic(() =>
    import('@/components/tools/SvgPathEditor').then(
      (module) => module.SvgPathEditor
    )
  ),
  'color-contrast-checker': dynamic(() =>
    import('@/components/tools/ColorContrastChecker').then(
      (module) => module.ColorContrastChecker
    )
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
        This tool has not been wired into the renderer yet.
      </div>
    );
  }

  return <Component />;
}
