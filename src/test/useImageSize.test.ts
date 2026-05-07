import { act, renderHook, waitFor } from '@testing-library/react';
import * as getImageSizeModule from '../lib/getImageSize';
import { useImageSize } from '../lib/useImageSize';

describe('useImageSize', () => {
  let getImageSizeSpy: jest.SpyInstance;

  beforeEach(() => {
    getImageSizeSpy = jest.spyOn(getImageSizeModule, 'getImageSize');
  });

  afterEach(() => {
    getImageSizeSpy.mockRestore();
  });

  it('should fetch image dimensions and update state on successful image load', async () => {
    const url = 'https://example.com/image.jpg';
    const dimensions = { width: 100, height: 200 };

    getImageSizeSpy.mockResolvedValueOnce(dimensions);

    const { result } = renderHook(() => useImageSize(url));

    expect(result.current[0]).toBeNull();
    expect(result.current[1].loading).toBe(true);

    await waitFor(() => {
      expect(result.current[1].loading).toBe(false);
    });

    expect(result.current[0]).toEqual(dimensions);
    expect(result.current[1].error).toBeNull();
  });

  it('should set error state on image loading error', async () => {
    const url = 'https://example.com/nonexistent.jpg';
    const errorMessage = 'Image not found';

    getImageSizeSpy.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useImageSize(url));

    await waitFor(() => {
      expect(result.current[1].loading).toBe(false);
    });

    expect(result.current[0]).toBeNull();
    expect(result.current[1].error).toEqual(errorMessage);
  });

  it('should update dimensions when the URL changes', async () => {
    const url1 = 'https://example.com/image1.jpg';
    const url2 = 'https://example.com/image2.jpg';
    const dimensions1 = { width: 100, height: 200 };
    const dimensions2 = { width: 300, height: 400 };

    getImageSizeSpy.mockResolvedValueOnce(dimensions1);

    const { result, rerender } = renderHook(
      ({ url }) => useImageSize(url),
      { initialProps: { url: url1 } }
    );

    await waitFor(() => {
      expect(result.current[0]).toEqual(dimensions1);
    });

    getImageSizeSpy.mockResolvedValueOnce(dimensions2);

    rerender({ url: url2 });

    expect(result.current[0]).toBeNull();
    expect(result.current[1].loading).toBe(true);

    await waitFor(() => {
      expect(result.current[0]).toEqual(dimensions2);
    });

    expect(result.current[1].loading).toBe(false);
    expect(result.current[1].error).toBeNull();
  });

  it('should not fetch when enabled is false', async () => {
    const url = 'https://example.com/image.jpg';

    const { result } = renderHook(() => useImageSize(url, { enabled: false }));

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(result.current[1].loading).toBe(false);
    expect(result.current[0]).toBeNull();
    expect(getImageSizeSpy).not.toHaveBeenCalled();
  });

  it('should fetch when enabled changes from false to true', async () => {
    const url = 'https://example.com/image.jpg';
    const dimensions = { width: 100, height: 200 };

    getImageSizeSpy.mockResolvedValueOnce(dimensions);

    const { result, rerender } = renderHook(
      ({ enabled }) => useImageSize(url, { enabled }),
      { initialProps: { enabled: false } }
    );

    expect(getImageSizeSpy).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await waitFor(() => {
      expect(result.current[0]).toEqual(dimensions);
    });
  });

  it('should re-fetch when refetch is called', async () => {
    const url = 'https://example.com/refetch.jpg';
    const dims1 = { width: 100, height: 200 };
    const dims2 = { width: 300, height: 400 };

    getImageSizeSpy.mockResolvedValueOnce(dims1).mockResolvedValueOnce(dims2);

    const { result } = renderHook(() => useImageSize(url));

    await waitFor(() => {
      expect(result.current[0]).toEqual(dims1);
    });

    act(() => {
      result.current[1].refetch();
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual(dims2);
    });
  });

  it('should set isPreviousData while loading new URL with keepPreviousData', async () => {
    const url1 = 'https://example.com/prev1.jpg';
    const url2 = 'https://example.com/prev2.jpg';
    const dims1 = { width: 100, height: 200 };
    const dims2 = { width: 300, height: 400 };

    getImageSizeSpy.mockResolvedValueOnce(dims1);

    const { result, rerender } = renderHook(
      ({ url }) => useImageSize(url, { keepPreviousData: true }),
      { initialProps: { url: url1 } }
    );

    await waitFor(() => expect(result.current[0]).toEqual(dims1));
    expect(result.current[1].isPreviousData).toBe(false);

    getImageSizeSpy.mockResolvedValueOnce(dims2);
    rerender({ url: url2 });

    expect(result.current[1].isPreviousData).toBe(true);

    await waitFor(() => expect(result.current[0]).toEqual(dims2));
    expect(result.current[1].isPreviousData).toBe(false);
  });

  it('should keep previous dimensions while loading new URL when keepPreviousData is true', async () => {
    const url1 = 'https://example.com/img1.jpg';
    const url2 = 'https://example.com/img2.jpg';
    const dimensions1 = { width: 100, height: 200 };
    const dimensions2 = { width: 300, height: 400 };

    getImageSizeSpy.mockResolvedValueOnce(dimensions1);

    const { result, rerender } = renderHook(
      ({ url }) => useImageSize(url, { keepPreviousData: true }),
      { initialProps: { url: url1 } }
    );

    await waitFor(() => {
      expect(result.current[0]).toEqual(dimensions1);
    });

    getImageSizeSpy.mockResolvedValueOnce(dimensions2);
    rerender({ url: url2 });

    expect(result.current[0]).toEqual(dimensions1);
    expect(result.current[1].loading).toBe(true);

    await waitFor(() => {
      expect(result.current[0]).toEqual(dimensions2);
    });
  });
});
