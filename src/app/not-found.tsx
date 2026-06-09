'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCommandPalette } from '@/lib/contexts/CommandPaletteContext';
import { CATEGORIES } from '@/lib/utils/tools-config';
import type { ToolCategory } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import {
  RefreshCw,
  Lock,
  Sparkles,
  FileCheck,
  Type,
  Wrench,
  ShieldCheck,
  Globe,
  Palette,
  Calculator,
  FileText,
  Image as ImageIcon,
  Home,
  ArrowLeft,
  Search,
  HelpCircle,
  Compass,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, typeof RefreshCw> = {
  RefreshCw,
  Lock,
  Sparkles,
  FileCheck,
  Type,
  Wrench,
  ShieldCheck,
  Globe,
  Palette,
  Calculator,
  FileText,
  Image: ImageIcon,
};

const CATEGORY_STYLES: Record<string, { border: string; bg: string; hover: string; text: string; glow: string }> = {
  converters: {
    border: 'border-blue-500/20 dark:border-blue-400/20',
    bg: 'bg-blue-500/5',
    hover: 'hover:border-blue-500/50 hover:bg-blue-500/10 dark:hover:border-blue-400/50 dark:hover:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]',
  },
  'encoders-decoders': {
    border: 'border-purple-500/20 dark:border-purple-400/20',
    bg: 'bg-purple-500/5',
    hover: 'hover:border-purple-500/50 hover:bg-purple-500/10 dark:hover:border-purple-400/50 dark:hover:bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]',
  },
  generators: {
    border: 'border-green-500/20 dark:border-green-400/20',
    bg: 'bg-green-500/5',
    hover: 'hover:border-green-500/50 hover:bg-green-500/10 dark:hover:border-green-400/50 dark:hover:bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]',
  },
  'formatters-validators': {
    border: 'border-orange-500/20 dark:border-orange-400/20',
    bg: 'bg-orange-500/5',
    hover: 'hover:border-orange-500/50 hover:bg-orange-500/10 dark:hover:border-orange-400/50 dark:hover:bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]',
  },
  'text-tools': {
    border: 'border-pink-500/20 dark:border-pink-400/20',
    bg: 'bg-pink-500/5',
    hover: 'hover:border-pink-500/50 hover:bg-pink-500/10 dark:hover:border-pink-400/50 dark:hover:bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]',
  },
  utilities: {
    border: 'border-cyan-500/20 dark:border-cyan-400/20',
    bg: 'bg-cyan-500/5',
    hover: 'hover:border-cyan-500/50 hover:bg-cyan-500/10 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]',
  },
  security: {
    border: 'border-red-500/20 dark:border-red-400/20',
    bg: 'bg-red-500/5',
    hover: 'hover:border-red-500/50 hover:bg-red-500/10 dark:hover:border-red-400/50 dark:hover:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  },
  networking: {
    border: 'border-indigo-500/20 dark:border-indigo-400/20',
    bg: 'bg-indigo-500/5',
    hover: 'hover:border-indigo-500/50 hover:bg-indigo-500/10 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]',
  },
  design: {
    border: 'border-violet-500/20 dark:border-violet-400/20',
    bg: 'bg-violet-500/5',
    hover: 'hover:border-violet-500/50 hover:bg-violet-500/10 dark:hover:border-violet-400/50 dark:hover:bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]',
  },
  calculators: {
    border: 'border-emerald-500/20 dark:border-emerald-400/20',
    bg: 'bg-emerald-500/5',
    hover: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  },
  'pdf-tools': {
    border: 'border-red-600/20 dark:border-red-500/20',
    bg: 'bg-red-600/5',
    hover: 'hover:border-red-600/50 hover:bg-red-600/10 dark:hover:border-red-500/50 dark:hover:bg-red-600/10',
    text: 'text-red-700 dark:text-red-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]',
  },
  'image-tools': {
    border: 'border-orange-600/20 dark:border-orange-500/20',
    bg: 'bg-orange-600/5',
    hover: 'hover:border-orange-600/50 hover:bg-orange-600/10 dark:hover:border-orange-500/50 dark:hover:bg-orange-600/10',
    text: 'text-orange-700 dark:text-orange-400',
    glow: 'group-hover:shadow-[0_0_15px_rgba(234,88,12,0.2)]',
  },
};

export default function NotFound() {
  const router = useRouter();
  const { toggle } = useCommandPalette();

  useEffect(() => {
    document.title = 'Page Not Found | LazyTools';
  }, []);

  const handleCategoryClick = (categoryId: ToolCategory) => {
    try {
      sessionStorage.setItem('home-selected-category', categoryId);
      sessionStorage.setItem('home-search-query', '');
      sessionStorage.setItem('home-favorites-only', 'false');
      sessionStorage.setItem('home-scroll-y', '0');
    } catch (e) {
      console.error(e);
    }
    router.push('/');
  };

  return (
    <div className="relative flex min-h-[75vh] flex-col items-center justify-center px-4 py-12 md:py-16 overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="h-[300px] w-[300px] rounded-full bg-primary/20 blur-[80px]" />
        <div className="h-[250px] w-[250px] rounded-full bg-blue-500/10 blur-[60px] translate-x-12 -translate-y-12" />
      </div>

      <div className="w-full max-w-3xl text-center space-y-8">
        {/* Animated 404 Illustration */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-blue-500 opacity-20 blur-xl animate-pulse" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-border bg-card shadow-xl">
            <HelpCircle className="h-14 w-14 text-muted-foreground" />
          </div>
        </div>

        {/* Text Heading */}
        <div className="space-y-3">
          <h1 className="text-6xl font-black tracking-tight sm:text-7xl bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Lost in Code?</h2>
          <p className="mx-auto max-w-lg text-muted-foreground text-sm sm:text-base">
            The tool or page you are looking for does not exist, has been renamed, or moved. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Main Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="default" className="w-full h-11 px-6 gap-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={toggle}
            className="w-full sm:w-auto h-11 px-6 gap-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10"
          >
            <Search className="h-4 w-4" />
            Search Tools
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto h-11 px-6 gap-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Category Shortcuts Section */}
        <div className="pt-6 border-t border-border/40 space-y-5">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Compass className="h-4 w-4 text-primary" />
            <span>Browse Tool Categories</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.values(CATEGORIES).map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon] || HelpCircle;
              const styles = CATEGORY_STYLES[cat.id] || {
                border: 'border-border',
                bg: 'bg-card',
                hover: 'hover:border-primary',
                text: 'text-foreground',
                glow: '',
              };

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={cn(
                    'group flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]',
                    styles.border,
                    styles.bg,
                    styles.hover,
                    styles.glow
                  )}
                >
                  <div className={cn('p-2.5 rounded-xl bg-background border border-border/50 mb-2 transition-transform duration-300 group-hover:scale-110 shadow-sm', styles.text)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold tracking-tight leading-tight group-hover:text-foreground">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
