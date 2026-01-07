import { useEffect, useState } from 'preact/hooks';

export function Toaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only load Sonner on client side
    if (typeof window !== 'undefined') {
      import('sonner').then(({ Toaster: SonnerToaster, toast }) => {
        // Make toast function globally available
        (window as any).toast = toast;
      });
    }
  }, []);

  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  // Render a placeholder div where Sonner will mount itself
  return (
    <div
      id="sonner-toaster"
      data-sonner-toaster
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999,
      }}
    />
  );
}
