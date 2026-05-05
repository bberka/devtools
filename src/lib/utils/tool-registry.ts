import type { ComponentType } from 'react';
import type { Tool } from '../types';

type ToolComponent = ComponentType;
type ToolComponentLoader = () => Promise<ToolComponent>;
type ToolMetadata = Omit<Tool, 'id'>;

type ToolRegistryEntry = ToolMetadata & {
  component: ToolComponentLoader;
};

export const TOOL_REGISTRY = {
  'pdf-split': {
    name: 'Split PDF',
    description: 'Extract specific pages or ranges from a PDF document',
    category: 'pdf-tools',
    icon: 'Scissors',
    keywords: ['pdf', 'split', 'extract', 'pages', 'documents'],
    component: () =>
      import('@/components/tools/PdfSplit').then(
        (module) => module.PdfSplit
      ),
  },
  'image-to-pdf': {
    name: 'Image to PDF',
    description: 'Convert images (JPEG, PNG) into a PDF document',
    category: 'pdf-tools',
    icon: 'FileImage',
    keywords: ['image', 'pdf', 'convert', 'jpeg', 'png'],
    component: () =>
      import('@/components/tools/ImageToPdf').then(
        (module) => module.ImageToPdf
      ),
  },
  'pdf-merge': {
    name: 'Merge PDF',
    description: 'Combine multiple PDF documents into a single file',
    category: 'pdf-tools',
    icon: 'Files',
    keywords: ['pdf', 'merge', 'combine', 'join', 'documents'],
    component: () =>
      import('@/components/tools/PdfMerge').then(
        (module) => module.PdfMerge
      ),
  },
  'markdown-to-pdf': {
    name: 'Markdown Converter',
    description: 'Convert Markdown to PDF, HTML, TXT, PNG, or JPG',
    category: 'pdf-tools',
    icon: 'FileText',
    keywords: ['markdown', 'pdf', 'html', 'convert', 'export', 'txt', 'png', 'jpg'],
    component: () =>
      import('@/components/tools/MarkdownConverter').then(
        (module) => module.MarkdownConverter
      ),
  },
  'html-converter': {
    name: 'HTML Converter',
    description: 'Convert HTML to PDF, Markdown, HTML, or plain text with export options',
    category: 'pdf-tools',
    icon: 'FileCode',
    keywords: [
      'html',
      'pdf',
      'markdown',
      'md',
      'plain text',
      'convert',
      'export',
      'print',
      'css',
    ],
    component: () =>
      import('@/components/tools/HtmlConverter').then(
        (module) => module.HtmlConverter
      ),
  },
  'color-blindness-simulator': {
    name: 'Color Blindness Simulator',
    description: 'Visualize images through various color blindness filters',
    category: 'image-tools',
    icon: 'Eye',
    keywords: ['color', 'blindness', 'simulator', 'protanopia', 'deuteranopia', 'accessibility'],
    component: () =>
      import('@/components/tools/ColorBlindnessSimulator').then(
        (module) => module.ColorBlindnessSimulator
      ),
  },
  'color-palette-extractor': {
    name: 'Color Palette Extractor',
    description: 'Extract dominant colors from any image',
    category: 'image-tools',
    icon: 'Palette',
    keywords: ['color', 'palette', 'extract', 'image', 'colors'],
    component: () =>
      import('@/components/tools/ColorPaletteExtractor').then(
        (module) => module.ColorPaletteExtractor
      ),
  },
  'image-to-icon': {
    name: 'Image to Icon',
    description: 'Convert images to multi-resolution ICO files',
    category: 'image-tools',
    icon: 'Box',
    keywords: ['image', 'icon', 'ico', 'favicon', 'convert'],
    component: () =>
      import('@/components/tools/ImageToIcon').then(
        (module) => module.ImageToIcon
      ),
  },
  'svg-to-png': {
    name: 'SVG to PNG Converter',
    description: 'Rasterize SVG code or files into high-resolution PNG images',
    category: 'image-tools',
    icon: 'FileImage',
    keywords: ['svg', 'png', 'rasterize', 'convert', 'vector'],
    component: () =>
      import('@/components/tools/SvgToPng').then(
        (module) => module.SvgToPng
      ),
  },
  'image-converter': {
    name: 'Image Converter & Editor',
    description: 'Convert, resize, rotate, flip, and apply filters to images',
    category: 'image-tools',
    icon: 'Image',
    keywords: ['image', 'convert', 'resize', 'rotate', 'flip', 'filters', 'ico', 'favicon'],
    component: () =>
      import('@/components/tools/ImageConverter').then(
        (module) => module.ImageConverter
      ),
  },
  'image-compressor': {
    name: 'Compress Image',
    description: 'Reduce image file size with adjustable quality and dimensions',
    category: 'image-tools',
    icon: 'Zap',
    keywords: ['image', 'compress', 'optimize', 'shrink', 'size'],
    component: () =>
      import('@/components/tools/ImageCompressor').then(
        (module) => module.ImageCompressor
      ),
  },
  'image-resizer': {
    name: 'Resize Image',
    description: 'Change image dimensions with aspect ratio control',
    category: 'image-tools',
    icon: 'Maximize',
    keywords: ['image', 'resize', 'dimensions', 'width', 'height'],
    component: () =>
      import('@/components/tools/ImageResizer').then(
        (module) => module.ImageResizer
      ),
  },
  'image-cropper': {
    name: 'Crop Image',
    description: 'Crop images with preset aspect ratios or free selection',
    category: 'image-tools',
    icon: 'Crop',
    keywords: ['image', 'crop', 'cut', 'aspect ratio'],
    component: () =>
      import('@/components/tools/ImageCropper').then(
        (module) => module.ImageCropper
      ),
  },
  'exif-viewer-remover': {
    name: 'EXIF Viewer & Remover',
    description: 'Inspect local image metadata and export a cleaned copy',
    category: 'image-tools',
    icon: 'Shield',
    keywords: ['exif', 'metadata', 'image', 'jpeg', 'gps', 'privacy', 'remove'],
    component: () =>
      import('@/components/tools/ExifViewerRemover').then(
        (module) => module.ExifViewerRemover
      ),
  },
  'base64-converter': {
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    category: 'encoders-decoders',
    icon: 'Binary',
    keywords: ['base64', 'encode', 'decode'],
    featured: true,
    component: () =>
      import('@/components/tools/Base64Converter').then(
        (module) => module.Base64Converter
      ),
  },
  'number-base-converter': {
    name: 'Number Base Converter',
    description: 'Convert between binary, decimal, hex, and octal',
    category: 'converters',
    icon: 'Hash',
    keywords: ['number', 'binary', 'hex', 'octal', 'decimal'],
    component: () =>
      import('@/components/tools/NumberBaseConverter').then(
        (module) => module.NumberBaseConverter
      ),
  },
  'json-yaml-xml': {
    name: 'JSON ↔ YAML ↔ XML',
    description: 'Convert between JSON, YAML, and XML formats',
    category: 'converters',
    icon: 'Code',
    keywords: ['json', 'yaml', 'xml', 'convert'],
    component: () =>
      import('@/components/tools/JsonYamlXmlConverter').then(
        (module) => module.JsonYamlXmlConverter
      ),
  },
  'yaml-json-converter': {
    name: 'YAML ↔ JSON Converter',
    description: 'Convert between YAML and JSON with focused formatting controls',
    category: 'converters',
    icon: 'ArrowRightLeft',
    keywords: ['yaml', 'json', 'converter', 'serialize', 'parse'],
    component: () =>
      import('@/components/tools/YamlJsonConverter').then(
        (module) => module.YamlJsonConverter
      ),
  },
  'csv-json-converter': {
    name: 'CSV ↔ JSON Converter',
    description: 'Convert CSV rows and JSON arrays with header-aware mapping',
    category: 'converters',
    icon: 'FileSpreadsheet',
    keywords: ['csv', 'json', 'converter', 'spreadsheet', 'table', 'delimiter'],
    component: () =>
      import('@/components/tools/CsvJsonConverter').then(
        (module) => module.CsvJsonConverter
      ),
  },
  'timestamp-converter': {
    name: 'Unix Timestamp Converter',
    description: 'Convert Unix timestamps to readable dates',
    category: 'converters',
    icon: 'Clock',
    keywords: ['timestamp', 'unix', 'date', 'time'],
    component: () =>
      import('@/components/tools/TimestampConverter').then(
        (module) => module.TimestampConverter
      ),
  },
  'url-encoder': {
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URL strings',
    category: 'encoders-decoders',
    icon: 'Link',
    keywords: ['url', 'encode', 'decode', 'uri'],
    component: () =>
      import('@/components/tools/UrlEncoder').then((module) => module.UrlEncoder),
  },
  'html-encoder': {
    name: 'HTML Encoder/Decoder',
    description: 'Encode and decode HTML entities',
    category: 'encoders-decoders',
    icon: 'Code2',
    keywords: ['html', 'encode', 'decode', 'entities'],
    component: () =>
      import('@/components/tools/HtmlEncoder').then(
        (module) => module.HtmlEncoder
      ),
  },
  'color-converter': {
    name: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL color formats',
    category: 'design',
    icon: 'Palette',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'convert'],
    component: () =>
      import('@/components/tools/ColorConverter').then(
        (module) => module.ColorConverter
      ),
  },
  'case-converter': {
    name: 'Case Converter',
    description: 'Transform text case (camelCase, snake_case, etc.)',
    category: 'text-tools',
    icon: 'CaseSensitive',
    keywords: ['case', 'camel', 'snake', 'pascal', 'kebab', 'convert'],
    component: () =>
      import('@/components/tools/CaseConverter').then(
        (module) => module.CaseConverter
      ),
  },
  'jwt-decoder': {
    name: 'JWT Decoder',
    description: 'Decode and inspect JWT tokens',
    category: 'encoders-decoders',
    icon: 'KeyRound',
    keywords: ['jwt', 'token', 'decode', 'authentication'],
    component: () =>
      import('@/components/tools/JwtDecoder').then((module) => module.JwtDecoder),
  },
  'text-escape': {
    name: 'Text Escape/Unescape',
    description: 'Escape and unescape special characters',
    category: 'encoders-decoders',
    icon: 'Quote',
    keywords: ['escape', 'unescape', 'text', 'special'],
    component: () =>
      import('@/components/tools/TextEscape').then((module) => module.TextEscape),
  },
  'hash-generator': {
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
    category: 'security',
    icon: 'Shield',
    keywords: ['hash', 'md5', 'sha', 'checksum'],
    featured: true,
    component: () =>
      import('@/components/tools/HashGenerator').then(
        (module) => module.HashGenerator
      ),
  },
  'uuid-generator': {
    name: 'UUID Generator',
    description: 'Generate UUIDs (v4, v7, Snowflake)',
    category: 'generators',
    icon: 'Fingerprint',
    keywords: ['uuid', 'guid', 'generate', 'unique'],
    featured: true,
    component: () =>
      import('@/components/tools/UuidGenerator').then(
        (module) => module.UuidGenerator
      ),
  },
  'password-generator': {
    name: 'Password Generator',
    description: 'Generate secure random passwords',
    category: 'generators',
    icon: 'Key',
    keywords: ['password', 'generate', 'random', 'secure'],
    component: () =>
      import('@/components/tools/PasswordGenerator').then(
        (module) => module.PasswordGenerator
      ),
  },
  'lorem-ipsum': {
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text',
    category: 'generators',
    icon: 'AlignLeft',
    keywords: ['lorem', 'ipsum', 'placeholder', 'text'],
    component: () =>
      import('@/components/tools/LoremIpsumGenerator').then(
        (module) => module.LoremIpsumGenerator
      ),
  },
  'sql-formatter': {
    name: 'SQL Formatter',
    description: 'Format SQL with multi-database support',
    category: 'formatters-validators',
    icon: 'Database',
    keywords: ['sql', 'format', 'database', 'query'],
    component: () =>
      import('@/components/tools/SqlFormatter').then(
        (module) => module.SqlFormatter
      ),
  },
  'json-formatter': {
    name: 'JSON Formatter',
    description: 'Format and validate JSON',
    category: 'formatters-validators',
    icon: 'Braces',
    keywords: ['json', 'format', 'validate', 'pretty'],
    featured: true,
    component: () =>
      import('@/components/tools/JsonFormatter').then(
        (module) => module.JsonFormatter
      ),
  },
  'json-validator': {
    name: 'JSON Validator',
    description: 'Validate JSON syntax and inspect normalized output',
    category: 'formatters-validators',
    icon: 'CheckCircle',
    keywords: ['json', 'validate', 'validator', 'syntax', 'parse'],
    component: () =>
      import('@/components/tools/JsonValidator').then(
        (module) => module.JsonValidator
      ),
  },
  'yaml-validator': {
    name: 'YAML Validator',
    description: 'Validate YAML syntax and inspect normalized output',
    category: 'formatters-validators',
    icon: 'FileCode',
    keywords: ['yaml', 'validate', 'validator', 'syntax', 'parse'],
    component: () =>
      import('@/components/tools/YamlValidator').then(
        (module) => module.YamlValidator
      ),
  },
  'xml-formatter': {
    name: 'XML Formatter',
    description: 'Format XML documents',
    category: 'formatters-validators',
    icon: 'FileCode',
    keywords: ['xml', 'format', 'pretty'],
    component: () =>
      import('@/components/tools/XmlFormatter').then(
        (module) => module.XmlFormatter
      ),
  },
  'xml-validator': {
    name: 'XML Validator',
    description: 'Validate XML syntax',
    category: 'formatters-validators',
    icon: 'CheckCircle',
    keywords: ['xml', 'validate', 'syntax'],
    component: () =>
      import('@/components/tools/XmlValidator').then(
        (module) => module.XmlValidator
      ),
  },
  'markdown-editor': {
    name: 'Markdown Editor',
    description: 'Write and preview Markdown with a toolbar and HTML export',
    category: 'text-tools',
    icon: 'FileCode',
    keywords: ['markdown', 'preview', 'render', 'editor', 'write', 'html', 'export'],
    component: () =>
      import('@/components/tools/MarkdownEditor').then(
        (module) => module.MarkdownEditor
      ),
  },
  'text-diff': {
    name: 'Text Diff Visualizer',
    description: 'Compare text with side-by-side and inline views',
    category: 'text-tools',
    icon: 'GitCompare',
    keywords: ['diff', 'compare', 'text', 'changes'],
    component: () =>
      import('@/components/tools/TextDiff').then((module) => module.TextDiff),
  },
  'regex-tester': {
    name: 'Regex Tester',
    description: 'Test regular expressions with highlighting',
    category: 'text-tools',
    icon: 'SearchCode',
    keywords: ['regex', 'regexp', 'test', 'pattern'],
    component: () =>
      import('@/components/tools/RegexTester').then(
        (module) => module.RegexTester
      ),
  },
  'word-counter': {
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and reading time',
    category: 'text-tools',
    icon: 'WholeWord',
    keywords: ['word', 'counter', 'characters', 'sentences', 'reading time', 'text'],
    component: () =>
      import('@/components/tools/WordCounter').then(
        (module) => module.WordCounter
      ),
  },
  'find-replace': {
    name: 'Find and Replace',
    description: 'Search text and preview literal or regex replacements',
    category: 'text-tools',
    icon: 'Replace',
    keywords: ['find', 'replace', 'search', 'regex', 'text'],
    component: () =>
      import('@/components/tools/FindAndReplace').then(
        (module) => module.FindAndReplace
      ),
  },
  'resume-ats-analyzer': {
    name: 'CV / Resume ATS Analyzer',
    description: 'Parse PDF resumes in the browser and score ATS readability',
    category: 'text-tools',
    icon: 'FileSearch',
    keywords: ['resume', 'cv', 'ats', 'pdf', 'readability', 'keywords', 'job description'],
    component: () =>
      import('@/components/tools/ResumeAtsAnalyzer').then(
        (module) => module.ResumeAtsAnalyzer
      ),
  },
  'cron-parser': {
    name: 'Cron Expression Parser',
    description: 'Parse and generate cron expressions',
    category: 'utilities',
    icon: 'Calendar',
    keywords: ['cron', 'schedule', 'parse', 'generate'],
    component: () =>
      import('@/components/tools/CronParser').then((module) => module.CronParser),
  },
  'qr-code-generator': {
    name: 'QR Code Generator',
    description: 'Generate QR codes for text and URLs with PNG and SVG export',
    category: 'generators',
    icon: 'QrCode',
    keywords: ['qr', 'qrcode', 'barcode', 'url', 'text', 'png', 'svg'],
    component: () =>
      import('@/components/tools/QrCodeGenerator').then(
        (module) => module.QrCodeGenerator
      ),
  },
  'gzip-compressor': {
    name: 'GZip Compressor / Decompressor',
    description: 'Compress and decompress text using browser-native GZip (output as Base64)',
    category: 'utilities',
    icon: 'PackageOpen',
    keywords: ['gzip', 'compress', 'decompress', 'deflate', 'base64', 'zip'],
    component: () =>
      import('@/components/tools/GzipCompressor').then(
        (module) => module.GzipCompressor
      ),
  },
  'rsa-key-generator': {
    name: 'RSA Key Pair Generator',
    description: 'Generate RSA public/private key pairs (client-side)',
    category: 'security',
    icon: 'KeySquare',
    keywords: ['rsa', 'key', 'pair', 'public', 'private', 'encryption', 'security'],
    component: () =>
      import('@/components/tools/RsaKeyGenerator').then(
        (module) => module.RsaKeyGenerator
      ),
  },
  'aes-encryption': {
    name: 'AES Encryption/Decryption',
    description: 'Encrypt and decrypt text using AES-256-GCM',
    category: 'security',
    icon: 'Lock',
    keywords: ['aes', 'encrypt', 'decrypt', 'security', 'cipher'],
    component: () =>
      import('@/components/tools/AesEncryption').then(
        (module) => module.AesEncryption
      ),
  },
  'bcrypt-hasher': {
    name: 'Bcrypt Hasher',
    description: 'Hash and verify passwords with bcrypt',
    category: 'security',
    icon: 'ShieldCheck',
    keywords: ['bcrypt', 'hash', 'password', 'verify', 'security'],
    component: () =>
      import('@/components/tools/BcryptHasher').then(
        (module) => module.BcryptHasher
      ),
  },
  'certificate-decoder': {
    name: 'Certificate Decoder',
    description: 'Inspect X.509 certificates: subject, issuer, SANs, key info, extensions, and fingerprints',
    category: 'security',
    icon: 'BadgeCheck',
    keywords: ['certificate', 'x509', 'ssl', 'tls', 'pem', 'crt', 'der', 'openssl', 'inspect', 'decode'],
    component: () =>
      import('@/components/tools/CertificateDecoder').then(
        (module) => module.CertificateDecoder
      ),
  },
  'ip-lookup': {
    name: 'IP Address Lookup',
    description: 'Get detailed information about an IP address',
    category: 'networking',
    icon: 'MapPin',
    keywords: ['ip', 'address', 'lookup', 'geolocation', 'network'],
    component: () =>
      import('@/components/tools/IpLookup').then((module) => module.IpLookup),
  },
  'dns-lookup': {
    name: 'DNS Records Lookup',
    description: 'Query DNS records (A, AAAA, MX, TXT, NS, etc.)',
    category: 'networking',
    icon: 'Server',
    keywords: ['dns', 'lookup', 'records', 'domain', 'nameserver'],
    component: () =>
      import('@/components/tools/DnsLookup').then((module) => module.DnsLookup),
  },
  'subnet-calculator': {
    name: 'Subnet Calculator',
    description: 'Calculate subnet masks, CIDR, IP ranges',
    category: 'networking',
    icon: 'Network',
    keywords: ['subnet', 'cidr', 'netmask', 'ip', 'calculator'],
    component: () =>
      import('@/components/tools/SubnetCalculator').then(
        (module) => module.SubnetCalculator
      ),
  },
  'port-checker': {
    name: 'Port Scanner',
    description: 'Check common ports and services (browser-compatible)',
    category: 'networking',
    icon: 'Radar',
    keywords: ['port', 'scanner', 'check', 'services', 'network'],
    component: () =>
      import('@/components/tools/PortChecker').then(
        (module) => module.PortChecker
      ),
  },
  'svg-path-editor': {
    name: 'SVG Path Editor/Optimizer',
    description: 'Edit, visualize, and optimize SVG path data',
    category: 'design',
    icon: 'Pen',
    keywords: ['svg', 'path', 'editor', 'optimize', 'visualize', 'vector'],
    component: () =>
      import('@/components/tools/SvgPathEditor').then(
        (module) => module.SvgPathEditor
      ),
  },
  'color-contrast-checker': {
    name: 'Color Contrast Checker',
    description: 'Check color contrast ratios for WCAG compliance',
    category: 'design',
    icon: 'Eye',
    keywords: ['color', 'contrast', 'wcag', 'accessibility', 'a11y', 'compliance'],
    component: () =>
      import('@/components/tools/ColorContrastChecker').then(
        (module) => module.ColorContrastChecker
      ),
  },
  'color-picker': {
    name: 'Color Picker',
    description: 'Pick colors, tune RGB/HSL channels, and copy CSS values',
    category: 'design',
    icon: 'Pipette',
    keywords: [
      'color',
      'picker',
      'eyedropper',
      'palette',
      'hex',
      'rgb',
      'hsl',
      'css',
      'swatch',
    ],
    component: () =>
      import('@/components/tools/ColorPicker').then(
        (module) => module.ColorPicker
      ),
  },
  'percentage-calculator': {
    name: 'Percentage Calculator',
    description: 'Calculate percentages, increases, decreases, and percentage change',
    category: 'calculators',
    icon: 'Percent',
    keywords: [
      'percentage',
      'percent',
      'calculator',
      'ratio',
      'increase',
      'decrease',
      'change',
      'math',
    ],
    component: () =>
      import('@/components/tools/PercentageCalculator').then(
        (module) => module.PercentageCalculator
      ),
  },
  'unit-converter': {
    name: 'Unit Converter',
    description: 'Convert between length, weight, temperature, time, speed, area, volume, and data units',
    category: 'calculators',
    icon: 'Scale',
    keywords: [
      'unit',
      'converter',
      'measurement',
      'length',
      'weight',
      'temperature',
      'speed',
      'time',
      'data',
      'area',
      'volume',
    ],
    component: () =>
      import('@/components/tools/UnitConverter').then(
        (module) => module.UnitConverter
      ),
  },
  'age-calculator': {
    name: 'Age Calculator',
    description: 'Calculate exact age between dates, plus total days and next birthday',
    category: 'calculators',
    icon: 'Cake',
    keywords: [
      'age',
      'birthday',
      'date of birth',
      'years',
      'months',
      'days',
      'next birthday',
      'calculator',
    ],
    component: () =>
      import('@/components/tools/AgeCalculator').then(
        (module) => module.AgeCalculator
      ),
  },
  'timezone-converter': {
    name: 'Timezone Converter',
    description: 'Convert date and time values between IANA time zones',
    category: 'calculators',
    icon: 'Clock3',
    keywords: [
      'timezone',
      'time zone',
      'convert',
      'date time',
      'utc',
      'offset',
      'iana',
      'world clock',
    ],
    component: () =>
      import('@/components/tools/TimezoneConverter').then(
        (module) => module.TimezoneConverter
      ),
  },
  'currency-converter': {
    name: 'Currency Converter',
    description: 'Convert currencies using live reference exchange rates',
    category: 'calculators',
    icon: 'BadgeDollarSign',
    keywords: [
      'currency',
      'exchange rate',
      'forex',
      'money',
      'usd',
      'eur',
      'convert',
      'live rates',
    ],
    component: () =>
      import('@/components/tools/CurrencyConverter').then(
        (module) => module.CurrencyConverter
      ),
  },
  'bmi-calculator': {
    name: 'BMI Calculator',
    description: 'Calculate adult BMI with metric or US customary units',
    category: 'calculators',
    icon: 'Scale',
    keywords: [
      'bmi',
      'body mass index',
      'weight',
      'height',
      'health',
      'metric',
      'pounds',
      'kilograms',
    ],
    component: () =>
      import('@/components/tools/BmiCalculator').then(
        (module) => module.BmiCalculator
      ),
  },
  'date-difference-calculator': {
    name: 'Date Difference Calculator',
    description: 'Calculate the exact difference between two dates',
    category: 'calculators',
    icon: 'CalendarRange',
    keywords: [
      'date',
      'difference',
      'duration',
      'days',
      'weeks',
      'months',
      'years',
      'calculator',
    ],
    component: () =>
      import('@/components/tools/DateDifferenceCalculator').then(
        (module) => module.DateDifferenceCalculator
      ),
  },
} as const satisfies Record<string, ToolRegistryEntry>;

export type ToolId = keyof typeof TOOL_REGISTRY;

export function getToolComponentLoader(id: string): ToolComponentLoader | undefined {
  return TOOL_REGISTRY[id as ToolId]?.component;
}
