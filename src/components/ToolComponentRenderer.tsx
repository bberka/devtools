'use client';

import { useEffect, useRef } from 'react';
import { useRecentTools } from '@/lib/contexts/RecentToolsContext';
import { TOOL_COMPONENTS } from './tool-components';

export function ToolComponentRenderer({ toolId }: { toolId: string }) {
  const { addRecentTool } = useRecentTools();
  const lastTrackedToolIdRef = useRef<string | null>(null);
  const Component = TOOL_COMPONENTS[toolId];

  useEffect(() => {
    if (lastTrackedToolIdRef.current === toolId) {
      return;
    }

    lastTrackedToolIdRef.current = toolId;
    addRecentTool(toolId);
  }, [addRecentTool, toolId]);

  if (!Component) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        This tool has not been wired into the registry yet.
      </div>
    );
  }

  return <Component />;
}
