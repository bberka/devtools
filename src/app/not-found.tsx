'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-5 px-2 text-center sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold sm:text-6xl">404</h1>
        <h2 className="text-xl font-semibold sm:text-2xl">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row">
        <Link href="/">
          <Button variant="default" className="min-h-11 w-full gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="min-h-11 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
