import { useState, useCallback } from 'preact/hooks';

export type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseActionButtonReturn {
  executeAction: (action: () => Promise<void> | void) => Promise<void>;
  status: ActionStatus;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

/**
 * Hook for managing button action states with loading and feedback
 * @param resetDelay - Time in ms before resetting to idle state (default: 2000)
 */
export function useActionButton(resetDelay = 2000): UseActionButtonReturn {
  const [status, setStatus] = useState<ActionStatus>('idle');

  const executeAction = useCallback(
    async (action: () => Promise<void> | void) => {
      setStatus('loading');

      try {
        await action();
        setStatus('success');

        // Reset status after delay
        setTimeout(() => {
          setStatus('idle');
        }, resetDelay);
      } catch (error) {
        console.error('Action failed:', error);
        setStatus('error');

        // Reset error after delay
        setTimeout(() => {
          setStatus('idle');
        }, resetDelay);
      }
    },
    [resetDelay]
  );

  const reset = useCallback(() => {
    setStatus('idle');
  }, []);

  return {
    executeAction,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    reset,
  };
}
