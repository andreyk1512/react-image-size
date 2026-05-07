import { useCallback, useEffect, useRef, useState } from 'react';
import { clearCacheEntry, getImageSize } from './getImageSize';
import { Dimensions, UseImageSizeOptions, UseImageSizeResult } from './types';

export const useImageSize = (url: string, options?: UseImageSizeOptions): UseImageSizeResult => {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviousData, setIsPreviousData] = useState(false);
  const [fetchCounter, setFetchCounter] = useState(0);

  const dimensionsRef = useRef<Dimensions | null>(null);
  dimensionsRef.current = dimensions;

  const timeout = options?.timeout;
  const retries = options?.retries;
  const crossOrigin = options?.crossOrigin;
  const staleTime = options?.staleTime;
  const enabled = options?.enabled ?? true;
  const keepPreviousData = options?.keepPreviousData ?? false;

  const refetch = useCallback(() => {
    clearCacheEntry(url);
    setFetchCounter(c => c + 1);
  }, [url]);

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      if (!keepPreviousData) {
        setDimensions(null);
        setIsPreviousData(false);
      } else {
        setIsPreviousData(dimensionsRef.current !== null);
      }
      setError(null);

      try {
        const { width, height } = await getImageSize(url, { timeout, retries, crossOrigin, staleTime, signal: controller.signal });

        if (!cancelled) {
          setDimensions({ width, height });
          setIsPreviousData(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setIsPreviousData(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url, timeout, retries, crossOrigin, staleTime, enabled, keepPreviousData, fetchCounter]);

  return [dimensions, { loading, error, refetch, isPreviousData }];
};
