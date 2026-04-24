'use client';

import dynamic from 'next/dynamic';
import { TOOL_REGISTRY } from '@/lib/utils/tool-registry';

export const TOOL_COMPONENTS = Object.fromEntries(
  Object.entries(TOOL_REGISTRY).map(([id, tool]) => [
    id,
    dynamic(tool.component),
  ])
);
