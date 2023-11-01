import { renderHook } from '@testing-library/react-hooks';
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

    const { result, waitForNextUpdate } = renderHook(() => useImageSize(url));

    expect(result.current[0]).toBeNull(); // Initial dimensions should be null
    expect(result.current[1].loading).toBe(true); // Loading state should be true

    await waitForNextUpdate();

    expect(result.current[0]).toEqual(dimensions); // Dimensions should be updated
    expect(result.current[1].loading).toBe(false); // Loading state should be false
    expect(result.current[1].error).toBeNull(); // Error state should be null
  });

  it('should set error state on image loading error', async () => {
    const url = 'https://example.com/nonexistent.jpg';
    const errorMessage = 'Image not found';

    // Mock the getImageSize function to throw an error
    getImageSizeSpy.mockRejectedValueOnce(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() => useImageSize(url));

    expect(result.current[0]).toBeNull(); // Initial dimensions should be null
    expect(result.current[1].loading).toBe(true); // Loading state should be true

    await waitForNextUpdate();

    expect(result.current[0]).toBeNull(); // Dimensions should remain null
    expect(result.current[1].loading).toBe(false); // Loading state should be false
    expect(result.current[1].error).toEqual(`Error: ${errorMessage}`); // Error state should be set
  });

  it('should update dimensions when the URL or options change', async () => {
    const url1 = 'https://example.com/image1.jpg';
    const url2 = 'https://example.com/image2.jpg';
    const dimensions1 = { width: 100, height: 200 };
    const dimensions2 = { width: 300, height: 400 };

    getImageSizeSpy.mockResolvedValueOnce(dimensions1);

    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ url }) => useImageSize(url),
      { initialProps: { url: url1 } }
    );

    expect(result.current[0]).toBeNull(); // Initial dimensions should be null
    expect(result.current[1].loading).toBe(true); // Loading state should be true

    await waitForNextUpdate();

    expect(result.current[0]).toEqual(dimensions1); // Dimensions should be updated

    getImageSizeSpy.mockResolvedValueOnce(dimensions2);

    // Rerender the hook with a new URL
    rerender({ url: url2 });

    expect(result.current[0]).toBeNull(); // Dimensions should be reset
    expect(result.current[1].loading).toBe(true); // Loading state should be true

    await waitForNextUpdate();

    expect(result.current[0]).toEqual(dimensions2); // New dimensions should be updated
  });
});
