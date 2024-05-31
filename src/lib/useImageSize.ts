import { useEffect, useState } from 'react';
import { getImageSize } from './getImageSize';
import { Dimensions, Options, UseImageSizeResult } from './types';

export const useImageSize = (url: string, options?: Options): UseImageSizeResult => {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setDimensions(null);
      setError(null);

      try {
        const { width, height } = await getImageSize(url, options);

        setDimensions({ width, height });
      } catch (error: unknown) {
        setError((error as string).toString());
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [url, options]);

  return [dimensions, { loading, error }];
};
