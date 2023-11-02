# <img src="https://akrupa1512-common-public.s3.eu-central-1.amazonaws.com/images/react-image-size-logo.png" alt="react-image-size" />

![npm type definitions](https://img.shields.io/npm/types/react-image-size)
![npm](https://img.shields.io/npm/v/react-image-size)
![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/react-image-size)
![NPM](https://img.shields.io/npm/l/react-image-size)
![npm](https://img.shields.io/npm/dw/react-image-size)

# Introduction
**react-image-size** is a JavaScript library for obtaining the width and height of an image from its URL. It provides a React hook and an asynchronous function for retrieving image dimensions.

## Installation
You can install the library using npm or yarn:

```shell
npm install -S react-image-size
```
or
```shell
yarn add react-image-size
```

## Usage
To use the library in your React project, you can import the useImageSize hook and call it with the image URL:

```typescript jsx
import { useImageSize } from 'react-image-size';

function App() {
  const [dimensions, { loading, error }] = useImageSize('https://example.com/image.jpg');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <p>Width: {dimensions?.width}</p>
      <p>Height: {dimensions?.height}</p>
    </div>
  );
}
```
You can also use the getImageSize function directly:
```typescript
import { getImageSize } from 'react-image-size';

async function fetchImageSize() {
    try {
        const dimensions = await getImageSize('https://example.com/image.jpg');
        console.log(dimensions);
    } catch (error) {
        console.error(error);
    }
}
```

### API Reference
The library exports two functions and two types:

#### useImageSize(url: string, options?: Options): UseImageSizeResult
A React hook that returns the dimensions of the image and a loading and error state. Parameters:
- url: the URL of the image
- options: an optional object with the following properties:
  - timeout: the maximum time in milliseconds to wait for the image to load before rejecting the Promise. Default is undefined.

Returns an array with the following elements:
- dimensions: an object with the width and height of the image, or null if the image has not yet loaded.
- state: an object with the following properties:
  - loading: a boolean indicating whether the image is currently loading.
  - error: a string containing an error message, or null if no error occurred.

#### getImageSize(url: string, options?: Options): Promise<Dimensions>
An asynchronous function that returns a Promise that resolves to an object with the width and height of the image. Parameters:
- url: the URL of the image
- options: an optional object with the following properties:
  - timeout: the maximum time in milliseconds to wait for the image to load before rejecting the Promise. Default is undefined.

Returns a Promise that resolves to an object with the following properties:
- width: the width of the image
- height: the height of the image

#### Options
An object with the following optional properties:
- timeout: the maximum time in milliseconds to wait for the image to load before rejecting the Promise. Default is undefined.

#### Dimensions
An object with the following properties:
- width: the width of the image
- height: the height of the image

### Conclusion
react-image-size is a lightweight and easy-to-use library for retrieving the dimensions of an image from its URL. With both a React hook and an asynchronous function available, it can be integrated seamlessly into any project.


### Migrate from V1 to V2
```typescript
OLD: import reactImageSize from 'react-image-size';
NEW: import { getImageSize } from 'react-image-size';

OLD: const { width, height } = await reactImageSize(imageUrl);
NEW: const { width, height } = await getImageSize(imageUrl);
```