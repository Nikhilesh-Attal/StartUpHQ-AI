import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getStartupSnapshot, 
  getTeamMembers, 
  getCanvasByStartup, 
  getSlidesByStartup, 
  getValidationEntriesByStartup, 
  getStartupIdeasByStartup 
} from '@/lib/db';

interface StartupData {
  startup: any | null;
  team: any[];
  leanCanvas: any;
  pitchDecks: any[];
  validation: any;
  idea: any;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useStartupData(startupId: string | null): StartupData {
  const [data, setData] = useState<Omit<StartupData, 'isLoading' | 'error' | 'refresh'>>({
    startup: null,
    team: [],
    leanCanvas: null,
    pitchDecks: [],
    validation: null,
    idea: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  const fetchData = useCallback(async () => {
    if (!startupId) return;

    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setIsLoading(true);
    setError(null);

    try {
      const [
        startup,
        team,
        leanCanvas,
        pitchDecks,
        validation,
        idea
      ] = await Promise.all([
        getStartupSnapshot(startupId),
        getTeamMembers(startupId),
        getCanvasByStartup(startupId, 'latest'),
        getSlidesByStartup(startupId).then(pd => pd ? Object.entries(pd) : []),
        getValidationEntriesByStartup(startupId),
        getStartupIdeasByStartup(startupId)
      ]);

      if (controller.signal.aborted) return;

      setData({
        startup,
        team,
        leanCanvas,
        pitchDecks,
        validation,
        idea
      });
      retryCountRef.current = 0;
    } catch (err) {
      if (controller.signal.aborted) return;
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCountRef.current)));
        fetchData();
        return;
      }
      
      console.error('Failed to fetch startup data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [startupId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
    
    // Cleanup function to abort fetch on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Add refresh on focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchData);
    
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchData);
    };
  }, [fetchData]);

  return {
    ...data,
    isLoading,
    error,
    refresh: fetchData
  };
}
