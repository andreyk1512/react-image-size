<img src="https://akrupa1512-common-public.s3.eu-central-1.amazonaws.com/images/react-image-size-logo.png" alt="react-image-size" />

[![npm](https://img.shields.io/npm/v/react-image-size)](https://www.npmjs.com/package/react-image-size)
[![npm bundle size](https://img.shields.io/bundlejs/size/react-image-size)](https://bundlejs.com/?q=react-image-size)
[![npm type definitions](https://img.shields.io/npm/types/react-image-size)](https://www.npmjs.com/package/react-image-size)
[![npm](https://img.shields.io/npm/dw/react-image-size)](https://www.npmjs.com/package/react-image-size)
[![NPM](https://img.shields.io/npm/l/react-image-size)](https://github.com/andreyk1512/react-image-size/blob/main/LICENSE)

**react-image-size** is a tiny, zero-dependency React library for getting the intrinsic width and height of any image from its URL. Ships with a React hook and a standalone async utility — both fully typed.

---

## Features

- **React hook** — `useImageSize` with `loading` and `error` state out of the box
- **Standalone function** — `getImageSize` for use outside of React components
- **Result caching** — repeated calls with the same URL return instantly from cache; configure freshness with `staleTime`
- **Request deduplication** — concurrent calls for the same URL share one in-flight request
- **Abort support** — cancel in-flight requests via `AbortSignal`
- **Retry support** — automatically retry failed loads with exponential backoff
- **Lazy loading** — skip fetching until `enabled: true`
- **Manual refetch** — call `refetch()` to bypass cache and re-fetch on demand
- **Keep previous data** — hold old dimensions + `isPreviousData` flag while new URL loads
- **CORS support** — configure `crossOrigin` attribute per request
- **Timeout support** — reject slow image loads automatically
- **SSR safe** — no crash in server-side rendering environments
- **Dual ESM / CJS** — works with any bundler or module system
- **Zero dependencies** — no runtime deps beyond React itself
- **Fully typed** — written in TypeScript, types included

---

## Installation

```sh
npm install react-image-size
```

```sh
yarn add react-image-size
```

---

## Quick Start

```tsx
import { useImageSize } from 'react-image-size';

function ImageInfo() {
  const [dimensions, { loading, error }] = useImageSize('https://example.com/photo.jpg');

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error}</p>;

  return (
    <p>
      {dimensions?.width} × {dimensions?.height}
    </p>
  );
}
```

---

## Usage

### `useImageSize` hook

The hook fetches image dimensions reactively. It re-fetches automatically when the URL or options change. Pending requests are automatically cancelled when the URL changes or the component unmounts.

```tsx
import { useImageSize } from 'react-image-size';

const [dimensions, { loading, error }] = useImageSize(url, options);
```

**With timeout and retries:**

```tsx
const [dimensions, { loading, error }] = useImageSize(url, {
  timeout: 5000,
  retries: 2,
});
```

**Lazy loading — fetch only when ready:**

```tsx
const [dimensions, { loading, error }] = useImageSize(url, {
  enabled: !!url,
});
```

**No flash on URL change with `keepPreviousData`:**

```tsx
const [dimensions, { loading, error, isPreviousData }] = useImageSize(url, {
  keepPreviousData: true,
});
// dimensions holds the previous image's size while the new one loads
// isPreviousData is true while the new URL is in-flight
```

**Manual refetch:**

```tsx
const [dimensions, { loading, refetch }] = useImageSize(url);

// Re-fetch on demand — bypasses cache
<button onClick={refetch}>Refresh</button>
```

**Stale-while-revalidate with `staleTime`:**

```tsx
const [dimensions, { loading }] = useImageSize(url, {
  staleTime: 60_000, // cache is fresh for 60s; re-fetch after that
});
```

**CORS image:**

```tsx
const [dimensions, { loading, error }] = useImageSize(url, {
  crossOrigin: 'anonymous',
});
```

**Full example:**

```tsx
function Avatar({ src }: { src: string }) {
  const [dimensions, { loading, error }] = useImageSize(src, {
    enabled: !!src,
    keepPreviousData: true,
    retries: 2,
    timeout: 5000,
  });

  if (loading) return <Skeleton />;
  if (error)   return <Fallback />;

  return (
    <img
      src={src}
      width={dimensions?.width}
      height={dimensions?.height}
      alt="avatar"
    />
  );
}
```

---

### `getImageSize` function

Use this outside of React (event handlers, utilities, Node.js scripts with a DOM polyfill, etc.).

```ts
import { getImageSize } from 'react-image-size';

const { width, height } = await getImageSize('https://example.com/photo.jpg');
```

**With retries:**

```ts
const { width, height } = await getImageSize(url, { retries: 3, timeout: 5000 });
```

**With abort support:**

```ts
import { getImageSize } from 'react-image-size';

const controller = new AbortController();

setTimeout(() => controller.abort(), 3000);

const { width, height } = await getImageSize(url, { signal: controller.signal });
```

**With error handling:**

```ts
import { getImageSize, Error as ImageError } from 'react-image-size';

try {
  const { width, height } = await getImageSize(url, { timeout: 5000, retries: 2 });
  console.log(width, height);
} catch (err) {
  if (err === ImageError.TIMEOUT)  console.error('Too slow');
  if (err === ImageError.ABORTED)  console.error('Cancelled');
  else                             console.error(err);
}
```

---

### `clearCache` function

Clears the entire in-memory dimensions cache.

```ts
import { clearCache } from 'react-image-size';

clearCache();
```

### `clearCacheEntry` function

Removes a single URL from the cache. `refetch()` calls this internally.

```ts
import { clearCacheEntry } from 'react-image-size';

clearCacheEntry('https://example.com/photo.jpg');
```

---

## API Reference

### `useImageSize(url, options?)`

| Parameter | Type | Description |
|---|---|---|
| `url` | `string` | URL of the image to measure |
| `options` | `UseImageSizeOptions` | Optional configuration (see below) |

**Returns** `[Dimensions | null, State]`

| Value | Type | Description |
|---|---|---|
| `dimensions` | `Dimensions \| null` | `{ width, height }` when loaded, `null` otherwise |
| `state.loading` | `boolean` | `true` while the image is being fetched |
| `state.error` | `string \| null` | Error message, or `null` if no error |
| `state.refetch` | `() => void` | Clears the cache entry and re-fetches |
| `state.isPreviousData` | `boolean` | `true` when dimensions are from the previous URL (only with `keepPreviousData`) |

---

### `getImageSize(url, options?)`

| Parameter | Type | Description |
|---|---|---|
| `url` | `string` | URL of the image to measure |
| `options` | `Options` | Optional configuration (see below) |

**Returns** `Promise<Dimensions>` — resolves with `{ width, height }` or rejects with an error string.

---

### `Options`

| Property | Type | Default | Description |
|---|---|---|---|
| `timeout` | `number` | `undefined` | Max milliseconds to wait before rejecting with `"Timeout"` |
| `signal` | `AbortSignal` | `undefined` | Abort signal to cancel the request |
| `retries` | `number` | `0` | Number of retry attempts on failure (exponential backoff: 1s, 2s, 3s…) |
| `crossOrigin` | `string` | `undefined` | Sets `img.crossOrigin` — use `'anonymous'` or `'use-credentials'` for CORS images |
| `staleTime` | `number` | `undefined` | Cache TTL in milliseconds. After this, the cached result is considered stale and re-fetched |

---

### `UseImageSizeOptions`

Extends `Options` with hook-specific fields:

| Property | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Set to `false` to skip fetching until ready |
| `keepPreviousData` | `boolean` | `false` | Keep previous dimensions while new URL is loading |

---

### `Dimensions`

```ts
type Dimensions = {
  width: number;
  height: number;
};
```

---

### `Error` constants

Predefined rejection values you can compare against in catch blocks:

```ts
import { Error as ImageError } from 'react-image-size';

ImageError.TIMEOUT               // 'Timeout'
ImageError.ABORTED               // 'Aborted'
ImageError.WINDOW_IS_NOT_DEFINED // 'Window is not defined'
ImageError.URL_IS_NOT_DEFINED    // 'Url is not defined'
```

---

## Migration Guide

### v2 → v3

**Error message format changed.** The `error` string from `useImageSize` no longer includes the `Error:` prefix:

```ts
// v2
state.error === 'Error: Image not found'

// v3
state.error === 'Image not found'
```

**ESM is now the default** for bundlers that resolve the `exports` field in `package.json`.

---

### v1 → v2

```ts
// v1
import reactImageSize from 'react-image-size';
const { width, height } = await reactImageSize(url);

// v2+
import { getImageSize } from 'react-image-size';
const { width, height } = await getImageSize(url);
```

---

## License

[MIT](./LICENSE) © [Andrii Krupa](https://github.com/andreyk1512)
