'use client';

import { TOOLS } from '@/lib/utils/tools-config';
import { useSettings } from '@/lib/contexts/SettingsContext';

export function HomeIntro() {
  const { compactMode } = useSettings();

  return (
    <div className="space-y-3 text-center sm:space-y-4">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        Developer Tools Collection
      </h1>
      {!compactMode && (
        <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg lg:text-xl">
          A comprehensive collection of {TOOLS.length}+ developer utilities for
          everyday tasks. All tools run entirely in your browser - no data ever
          leaves your device.
        </p>
      )}
    </div>
  );
}
