import { useEffect, useState } from 'react';
import { getImageSize } from './getImageSize';
import { Dimensions, Options, UseImageSizeResult } from './types';

export const useImageSize = (url: string, options?: Options): UseImageSizeResult => {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeout = options?.timeout;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setDimensions(null);
      setError(null);

      try {
        const { width, height } = await getImageSize(url, { timeout });

        if (!cancelled) {
          setDimensions({ width, height });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [url, timeout]);

  return [dimensions, { loading, error }];
};
