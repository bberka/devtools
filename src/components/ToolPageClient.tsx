'use client';

import Link from 'next/link';
import { type ReactNode, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useRecentTools } from '@/lib/contexts/RecentToolsContext';
import type { Tool } from '@/lib/types';

export function ToolPageClient({
  children,
  tool,
}: {
  children: ReactNode;
  tool: Tool;
}) {
  const { addRecentTool } = useRecentTools();
  const lastTrackedToolIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedToolIdRef.current === tool.id) {
      return;
    }

    lastTrackedToolIdRef.current = tool.id;
    addRecentTool(tool.id);
  }, [addRecentTool, tool.id]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold sm:text-3xl">
              {tool.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {tool.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 justify-end sm:block">
          <FavoriteButton toolId={tool.id} variant="icon" />
        </div>
      </div>

      {children}
    </div>
  );
}
