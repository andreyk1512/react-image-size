declare type Options = {
  timeout?: number
};

declare type Dimensions = {
  width: number;
  height: number;
};

declare function getImageSize(url: string, options?: Options): Promise<Dimensions>

declare type UseImageSizeResult = [
  Dimensions | null,
  { loading: boolean; error: string | null; },
];

declare function useImageSize(url: string, options?: Options): UseImageSizeResult;
