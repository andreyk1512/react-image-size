/**
 * @jest-environment node
 */
import { getImageSize } from '../lib/getImageSize';

it('should reject with "Window is not defined" if not running in a browser environment', async () => {
  await expect(getImageSize('https://example.com/image.jpg')).rejects.toBe('Window is not defined');
});
