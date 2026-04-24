'use client';

import { TOOLS } from '@/lib/utils/tools-config';
import { useSettings } from '@/lib/contexts/SettingsContext';

export function HomeIntro() {
  const { compactMode } = useSettings();

  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Developer Tools Collection
      </h1>
      {!compactMode && (
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive collection of {TOOLS.length}+ developer utilities for
          everyday tasks. All tools run entirely in your browser - no data ever
          leaves your device.
        </p>
      )}
    </div>
  );
}
