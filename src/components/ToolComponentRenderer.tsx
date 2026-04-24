'use client';

import { useEffect, useRef } from 'react';
import { useRecentTools } from '@/lib/contexts/RecentToolsContext';
import { MarkdownConverter } from '@/components/tools/MarkdownConverter';
import { ImageConverter } from '@/components/tools/ImageConverter';
import { Base64Converter } from '@/components/tools/Base64Converter';
import { NumberBaseConverter } from '@/components/tools/NumberBaseConverter';
import { JsonYamlXmlConverter } from '@/components/tools/JsonYamlXmlConverter';
import { TimestampConverter } from '@/components/tools/TimestampConverter';
import { UrlEncoder } from '@/components/tools/UrlEncoder';
import { HtmlEncoder } from '@/components/tools/HtmlEncoder';
import { HtmlConverter } from '@/components/tools/HtmlConverter';
import { ColorConverter } from '@/components/tools/ColorConverter';
import { CaseConverter } from '@/components/tools/CaseConverter';
import { JwtDecoder } from '@/components/tools/JwtDecoder';
import { TextEscape } from '@/components/tools/TextEscape';
import { HashGenerator } from '@/components/tools/HashGenerator';
import { UuidGenerator } from '@/components/tools/UuidGenerator';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { LoremIpsumGenerator } from '@/components/tools/LoremIpsumGenerator';
import { SqlFormatter } from '@/components/tools/SqlFormatter';
import { JsonFormatter } from '@/components/tools/JsonFormatter';
import { XmlFormatter } from '@/components/tools/XmlFormatter';
import { XmlValidator } from '@/components/tools/XmlValidator';
import { MarkdownPreviewer } from '@/components/tools/MarkdownPreviewer';
import { TextDiff } from '@/components/tools/TextDiff';
import { RegexTester } from '@/components/tools/RegexTester';
import { CronParser } from '@/components/tools/CronParser';
import { RsaKeyGenerator } from '@/components/tools/RsaKeyGenerator';
import { AesEncryption } from '@/components/tools/AesEncryption';
import { BcryptHasher } from '@/components/tools/BcryptHasher';
import { IpLookup } from '@/components/tools/IpLookup';
import { DnsLookup } from '@/components/tools/DnsLookup';
import { SubnetCalculator } from '@/components/tools/SubnetCalculator';
import { PortChecker } from '@/components/tools/PortChecker';
import { SvgPathEditor } from '@/components/tools/SvgPathEditor';
import { ColorContrastChecker } from '@/components/tools/ColorContrastChecker';

const TOOL_COMPONENTS = {
  'markdown-to-pdf': MarkdownConverter,
  'image-converter': ImageConverter,
  'base64-converter': Base64Converter,
  'number-base-converter': NumberBaseConverter,
  'json-yaml-xml': JsonYamlXmlConverter,
  'timestamp-converter': TimestampConverter,
  'url-encoder': UrlEncoder,
  'html-encoder': HtmlEncoder,
  'html-converter': HtmlConverter,
  'color-converter': ColorConverter,
  'case-converter': CaseConverter,
  'jwt-decoder': JwtDecoder,
  'text-escape': TextEscape,
  'hash-generator': HashGenerator,
  'uuid-generator': UuidGenerator,
  'password-generator': PasswordGenerator,
  'lorem-ipsum': LoremIpsumGenerator,
  'sql-formatter': SqlFormatter,
  'json-formatter': JsonFormatter,
  'xml-formatter': XmlFormatter,
  'xml-validator': XmlValidator,
  'markdown-preview': MarkdownPreviewer,
  'text-diff': TextDiff,
  'regex-tester': RegexTester,
  'cron-parser': CronParser,
  'rsa-key-generator': RsaKeyGenerator,
  'aes-encryption': AesEncryption,
  'bcrypt-hasher': BcryptHasher,
  'ip-lookup': IpLookup,
  'dns-lookup': DnsLookup,
  'subnet-calculator': SubnetCalculator,
  'port-checker': PortChecker,
  'svg-path-editor': SvgPathEditor,
  'color-contrast-checker': ColorContrastChecker,
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
