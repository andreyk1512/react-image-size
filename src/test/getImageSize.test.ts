import { clearCache, clearCacheEntry, getImageSize } from '../lib/getImageSize';

type LoadCallback = (data: { width: number; height: number }) => void;
type ErrorCallback = (data: { type: string; message: string }) => void;

describe('getImageSize', () => {
  let originalImage: typeof window.Image;

  beforeEach(() => {
    originalImage = window.Image;
  });

  afterEach(() => {
    window.Image = originalImage;
    clearCache();
  });

  it('should resolve with the correct dimensions when the image loads', async () => {
    const url = 'https://example.com/image.jpg';
    const expectedDimensions = { width: 100, height: 200 };

    const imageMock = {
      addEventListener: (event: string, callback: LoadCallback) => {
        if (event === 'load') callback(expectedDimensions);
      },
      naturalWidth: expectedDimensions.width,
      naturalHeight: expectedDimensions.height,
      src: '',
    };
    window.Image = jest.fn(() => imageMock) as unknown as typeof window.Image;

    const dimensions = await getImageSize(url);

    expect(dimensions).toEqual(expectedDimensions);
  });

  it('should return cached dimensions on repeated calls with the same URL', async () => {
    const url = 'https://example.com/cached.jpg';
    const expectedDimensions = { width: 300, height: 400 };

    const imageMock = {
      addEventListener: (event: string, callback: LoadCallback) => {
        if (event === 'load') callback(expectedDimensions);
      },
      naturalWidth: expectedDimensions.width,
      naturalHeight: expectedDimensions.height,
      src: '',
    };
    window.Image = jest.fn(() => imageMock) as unknown as typeof window.Image;

    await getImageSize(url);
    window.Image = jest.fn(() => { throw new Error('should not be called'); }) as unknown as typeof window.Image;

    const dimensions = await getImageSize(url);

    expect(dimensions).toEqual(expectedDimensions);
  });

  it('should reject with an error message when the image fails to load', async () => {
    const url = 'https://example.com/broken.jpg';
    const errorMessage = 'Error message';

    const imageMock = {
      addEventListener: (event: string, callback: ErrorCallback) => {
        if (event === 'error') callback({ type: 'error', message: errorMessage });
      },
      src: '',
    };
    window.Image = jest.fn(() => imageMock) as unknown as typeof window.Image;

    await expect(getImageSize(url)).rejects.toEqual(`error: ${errorMessage}`);
  });

  it('should reject with "Url is not defined" when the URL is not provided', async () => {
    await expect(getImageSize('')).rejects.toBe('Url is not defined');
  });

  it('should reject with "Timeout" if a timeout option is provided and the image loading takes longer', async () => {
    const url = 'https://example.com/slow.jpg';

    const imageMock = {
      addEventListener: jest.fn(),
      src: '',
    };
    window.Image = jest.fn(() => imageMock) as unknown as typeof window.Image;

    await expect(getImageSize(url, { timeout: 100 })).rejects.toBe('Timeout');
  });

  it('should reject with "Aborted" when signal is aborted', async () => {
    const url = 'https://example.com/abort.jpg';
    const controller = new AbortController();

    const imageMock = {
      addEventListener: jest.fn(),
      src: '',
    };
    window.Image = jest.fn(() => imageMock) as unknown as typeof window.Image;

    const promise = getImageSize(url, { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toBe('Aborted');
  });

  it('should retry on failure and eventually resolve', async () => {
    jest.useFakeTimers();

    const url = 'https://example.com/retry.jpg';
    const dimensions = { width: 100, height: 200 };
    let callCount = 0;

    window.Image = jest.fn(() => {
      callCount++;
      const shouldFail = callCount === 1;
      return {
        addEventListener: (event: string, callback: LoadCallback | ErrorCallback) => {
          if (shouldFail && event === 'error') {
            (callback as ErrorCallback)({ type: 'error', message: 'network error' });
          } else if (!shouldFail && event === 'load') {
            (callback as LoadCallback)(dimensions);
          }
        },
        naturalWidth: dimensions.width,
        naturalHeight: dimensions.height,
        src: '',
      };
    }) as unknown as typeof window.Image;

    const promise = getImageSize(url, { retries: 1 });

    await jest.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toEqual(dimensions);
    expect(callCount).toBe(2);

    jest.useRealTimers();
  });

  it('should deduplicate in-flight requests for the same URL', async () => {
    const url = 'https://example.com/dedup.jpg';
    const dims = { width: 100, height: 200 };
    let imageCount = 0;
    let resolveLoad: LoadCallback | undefined;

    window.Image = jest.fn(() => {
      imageCount++;
      return {
        addEventListener: (event: string, cb: LoadCallback) => {
          if (event === 'load') resolveLoad = cb;
        },
        naturalWidth: dims.width,
        naturalHeight: dims.height,
        src: '',
      };
    }) as unknown as typeof window.Image;

    const p1 = getImageSize(url);
    const p2 = getImageSize(url);
    resolveLoad!(dims);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual(dims);
    expect(r2).toEqual(dims);
    expect(imageCount).toBe(1);
  });

  it('should re-fetch when staleTime has elapsed', async () => {
    jest.useFakeTimers();
    const url = 'https://example.com/stale.jpg';
    const dims1 = { width: 100, height: 200 };
    const dims2 = { width: 300, height: 400 };

    window.Image = jest.fn(() => ({
      addEventListener: (event: string, cb: LoadCallback) => {
        if (event === 'load') cb(dims1);
      },
      naturalWidth: dims1.width,
      naturalHeight: dims1.height,
      src: '',
    })) as unknown as typeof window.Image;

    await getImageSize(url, { staleTime: 1000 });

    jest.advanceTimersByTime(1001);

    window.Image = jest.fn(() => ({
      addEventListener: (event: string, cb: LoadCallback) => {
        if (event === 'load') cb(dims2);
      },
      naturalWidth: dims2.width,
      naturalHeight: dims2.height,
      src: '',
    })) as unknown as typeof window.Image;

    const result = await getImageSize(url, { staleTime: 1000 });
    expect(result).toEqual(dims2);

    jest.useRealTimers();
  });

  it('should clear specific cache entry with clearCacheEntry', async () => {
    const url = 'https://example.com/entry.jpg';
    const dims = { width: 100, height: 200 };
    let callCount = 0;

    window.Image = jest.fn(() => {
      callCount++;
      return {
        addEventListener: (event: string, cb: LoadCallback) => {
          if (event === 'load') cb(dims);
        },
        naturalWidth: dims.width,
        naturalHeight: dims.height,
        src: '',
      };
    }) as unknown as typeof window.Image;

    await getImageSize(url);
    expect(callCount).toBe(1);

    clearCacheEntry(url);
    await getImageSize(url);
    expect(callCount).toBe(2);
  });

  it('should set crossOrigin attribute when option is provided', async () => {
    const url = 'https://example.com/cors.jpg';
    const expectedDimensions = { width: 50, height: 50 };
    let capturedCrossOrigin: string | null = null;

    const imageMock = {
      set crossOrigin(value: string) { capturedCrossOrigin = value; },
      addEventListener: (event: string, callback: LoadCallback) => {
        if (event === 'load') callback(expectedDimensions);
      },
      naturalWidth: expectedDimensions.width,
      naturalHeight: expectedDimensions.height,
      src: '',
    };
    window.Image = jest.fn(() => imageMock) as unknown as typeof window.Image;

    await getImageSize(url, { crossOrigin: 'anonymous' });

    expect(capturedCrossOrigin).toBe('anonymous');
  });
});
