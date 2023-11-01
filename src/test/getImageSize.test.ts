import { getImageSize } from '../lib/getImageSize';

type EventListenerCallback = (data: { width: number; height: number }) => void;
type ErrorEventListenerCallback = (data: { type: string; message: string }) => void;

describe('getImageSize', () => {
  let windowSpy: jest.SpyInstance;
  let imageSpy: jest.SpyInstance;

  beforeEach(() => {
    windowSpy = jest.spyOn(globalThis, 'window', 'get');
    imageSpy = jest.spyOn(globalThis.window, 'Image');
  });

  afterEach(() => {
    windowSpy.mockRestore();
    imageSpy.mockRestore();
  });

  it('should resolve with the correct dimensions when the image loads', async () => {
    const url = 'https://example.com/image.jpg';
    const expectedDimensions = { width: 100, height: 200 };

    const imageMock = {
      addEventListener: (event: string, callback: EventListenerCallback) => {
        if (event === 'load') {
          callback(expectedDimensions);
        }
      },
      naturalWidth: expectedDimensions.width,
      naturalHeight: expectedDimensions.height,
      src: url,
    };
    imageSpy.mockImplementationOnce(() => imageMock);

    const dimensions = await getImageSize(url);

    expect(dimensions).toEqual(expectedDimensions);
  });

  it('should reject with an error message when the image fails to load', async () => {
    const url = 'https://example.com/image.jpg';
    const errorMessage = 'Error message';

    const imageMock = {
      addEventListener: (event: string, callback: ErrorEventListenerCallback) => {
        if (event === 'error') {
          callback({ type: 'error', message: errorMessage });
        }
      },
      src: url,
    };
    imageSpy.mockImplementationOnce(() => imageMock);

    try {
      await getImageSize(url);

      expect(true).toBe(false);
    } catch (error) {
      expect(error).toEqual(`error: ${errorMessage}`);
    }
  });

  it('should reject with "Window is not defined" if not running in a browser environment', async () => {
    const url = 'https://example.com/image.jpg';

    windowSpy.mockImplementation(() => undefined);

    try {
      await getImageSize(url);

      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBe('Window is not defined');
    }
  });

  it('should reject with "Url is not defined" when the URL is not provided', async () => {
    const url = '';

    try {
      await getImageSize(url);

      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBe('Url is not defined');
    }
  });

  it('should reject with "Timeout" if a timeout option is provided and the image loading takes longer', async () => {
    const url = 'https://example.com/image.jpg';
    const timeout = 100;

    const imageMock = {
      addEventListener: jest.fn(),
      src: url,
    };
    imageSpy.mockImplementationOnce(() => imageMock);

    try {
      await getImageSize(url, { timeout });

      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBe('Timeout');
    }
  });
});
