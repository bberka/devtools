import { HomeContent } from '@/components/HomeContent';
import { TOOLS } from '@/lib/utils/tools-config';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Developer Tools Collection
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive collection of {TOOLS.length}+ developer utilities for everyday tasks.
          All tools run entirely in your browser - no data ever leaves your device.
        </p>
      </div>

      <HomeContent />
    </div>
  );
}
