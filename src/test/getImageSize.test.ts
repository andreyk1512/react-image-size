import { getImageSize } from '../lib/getImageSize';

type LoadCallback = (data: { width: number; height: number }) => void;
type ErrorCallback = (data: { type: string; message: string }) => void;

describe('getImageSize', () => {
  let originalImage: typeof window.Image;

  beforeEach(() => {
    originalImage = window.Image;
  });

  afterEach(() => {
    window.Image = originalImage;
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

  it('should reject with an error message when the image fails to load', async () => {
    const url = 'https://example.com/image.jpg';
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
    const url = 'https://example.com/image.jpg';

    const imageMock = {
      addEventListener: jest.fn(),
      src: '',
    };
    window.Image = jest.fn(() => imageMock) as unknown as typeof window.Image;

    await expect(getImageSize(url, { timeout: 100 })).rejects.toBe('Timeout');
  });
});
