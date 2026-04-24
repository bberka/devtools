import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS, getToolById, CATEGORIES } from '@/lib/utils/tools-config';
import { ToolPageClient } from '@/components/ToolPageClient';

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all tools
export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}

// Generate metadata for each tool page
export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolById(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }

  const category = CATEGORIES[tool.category];
  const keywords = [
    tool.name,
    ...(tool.keywords || []),
    category.name,
    'developer tool',
    'online tool',
    'free tool',
    'browser tool',
  ];

  return {
    title: tool.name,
    description: tool.description,
    keywords,
    openGraph: {
      title: tool.name,
      description: tool.description,
      type: 'website',
      url: `/tools/${tool.id}`,
    },
    twitter: {
      card: 'summary',
      title: tool.name,
      description: tool.description,
    },
    alternates: {
      canonical: `/tools/${tool.id}`,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolById(slug);

  if (!tool) {
    notFound();
  }

  const resolvedTool = tool;

  return <ToolPageClient tool={resolvedTool} />;
}
