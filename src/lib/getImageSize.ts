import { ErrorMessage } from './constants';
import { Dimensions, Options } from './types';

type CacheEntry = { dimensions: Dimensions; timestamp: number };

const cache = new Map<string, CacheEntry>();
const inflightCache = new Map<string, Promise<Dimensions>>();

export const clearCache = (): void => {
  cache.clear();
  inflightCache.clear();
};

export const clearCacheEntry = (url: string): void => {
  cache.delete(url);
  inflightCache.delete(url);
};

const NON_RETRYABLE = new Set<string>([
  ErrorMessage.ABORTED,
  ErrorMessage.URL_IS_NOT_DEFINED,
  ErrorMessage.WINDOW_IS_NOT_DEFINED,
]);

const loadImage = (url: string, options: Omit<Options, 'signal' | 'staleTime'>): Promise<Dimensions> =>
  new Promise((resolve, reject) => {
    const { timeout, crossOrigin } = options;
    let timer: number | null = null;
    const img = new Image();

    if (crossOrigin !== undefined) img.crossOrigin = crossOrigin;

    const cleanup = () => {
      if (timer) window.clearTimeout(timer);
    };

    img.addEventListener('load', () => {
      cleanup();
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    });

    img.addEventListener('error', (event) => {
      cleanup();
      reject(`${event.type}: ${event.message}`);
    });

    img.src = url;

    if (timeout) {
      timer = window.setTimeout(() => {
        img.src = '';
        reject(ErrorMessage.TIMEOUT);
      }, timeout);
    }
  });

const createSharedPromise = (url: string, options: Omit<Options, 'signal' | 'staleTime'>): Promise<Dimensions> => {
  const retries = options.retries ?? 0;

  const attempt = (attemptsLeft: number): Promise<Dimensions> =>
    loadImage(url, options).then(
      (dimensions) => {
        cache.set(url, { dimensions, timestamp: Date.now() });
        inflightCache.delete(url);
        return dimensions;
      },
      (err: string) => {
        if (attemptsLeft > 0 && !NON_RETRYABLE.has(err)) {
          const delay = (retries - attemptsLeft + 1) * 1000;
          return new Promise<void>(resolve => setTimeout(resolve, delay))
            .then(() => attempt(attemptsLeft - 1));
        }
        inflightCache.delete(url);
        return Promise.reject(err);
      }
    );

  const promise = attempt(retries);
  inflightCache.set(url, promise);
  return promise;
};

export const getImageSize = (url: string, options: Options = {}): Promise<Dimensions> => {
  if (typeof window === 'undefined') return Promise.reject(ErrorMessage.WINDOW_IS_NOT_DEFINED);
  if (!url) return Promise.reject(ErrorMessage.URL_IS_NOT_DEFINED);

  const { signal, staleTime, ...coreOptions } = options;

  const entry = cache.get(url);
  if (entry) {
    const isStale = staleTime !== undefined && (Date.now() - entry.timestamp) > staleTime;
    if (!isStale) {
      return signal?.aborted
        ? Promise.reject(ErrorMessage.ABORTED)
        : Promise.resolve(entry.dimensions);
    }
    cache.delete(url);
  }

  const shared = inflightCache.get(url) ?? createSharedPromise(url, coreOptions);

  if (!signal) return shared;

  return new Promise<Dimensions>((resolve, reject) => {
    if (signal.aborted) return reject(ErrorMessage.ABORTED);

    const onAbort = () => reject(ErrorMessage.ABORTED);
    signal.addEventListener('abort', onAbort, { once: true });

    shared.then(
      (dims) => {
        signal.removeEventListener('abort', onAbort);
        resolve(dims);
      },
      (err) => {
        signal.removeEventListener('abort', onAbort);
        reject(err);
      }
    );
  });
};
