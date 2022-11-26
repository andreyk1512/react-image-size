# react-image-size

A JavaScript module to get size (dimensions) of any image file by url

## Programmatic Usage

```shell
npm install react-image-size --save
```

or

```shell
yarn add react-image-size
```

### Migrate to V2
```javascript
//import reactImageSize from 'react-image-size';
import { getImageSize } from 'react-image-size';

//const { width, height } = await reactImageSize(imageUrl);
const { width, height } = await getImageSize(imageUrl);
```

### Using hook
```javascript
import React from 'react';
import { useImageSize } from 'react-image-size';

const url = 'image-url';

function App() {
  // data - Object with width and height OR null
  // loading - Indicator of loading
  // error - String with error description OR null
  const [data, { loading, error }] = useImageSize(url);

  return ...;
}
```

### Using promises
```javascript
import { getImageSize } from 'react-image-size';

getImageSize(imageUrl)
  .then(({ width, height }) => ...)
  .catch((errorMessage) => ...);
```

### With reject timer
```javascript
import { getImageSize } from 'react-image-size';

const rejectTimeout = 5000; // ms

try {
  const { width, height } = await getImageSize(imageUrl, rejectTimeout);
  ...
} catch (errorMessage) {
  // if request takes longer than 5 seconds an timeout exception will be thrown
}
```
