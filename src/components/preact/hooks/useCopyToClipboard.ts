import { useState, useCallback } from 'preact/hooks';

export type CopyStatus = 'idle' | 'copying' | 'copied' | 'error';

export interface UseCopyToClipboardReturn {
  copyToClipboard: (text: string) => Promise<void>;
  status: CopyStatus;
  isCopied: boolean;
  isError: boolean;
}

/**
 * Hook for copying text to clipboard with visual feedback
 * @param resetDelay - Time in ms before resetting to idle state (default: 2000)
 */
export function useCopyToClipboard(resetDelay = 2000): UseCopyToClipboardReturn {
  const [status, setStatus] = useState<CopyStatus>('idle');

  const copyToClipboard = useCallback(
    async (text: string) => {
      if (!text) return;

      setStatus('copying');

      try {
        await navigator.clipboard.writeText(text);
        setStatus('copied');

        // Reset status after delay
        setTimeout(() => {
          setStatus('idle');
        }, resetDelay);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        setStatus('error');

        // Reset error after delay
        setTimeout(() => {
          setStatus('idle');
        }, resetDelay);
      }
    },
    [resetDelay]
  );

  return {
    copyToClipboard,
    status,
    isCopied: status === 'copied',
    isError: status === 'error',
  };
}
