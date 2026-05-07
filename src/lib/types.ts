export type Options = {
  timeout?: number;
  signal?: AbortSignal;
  retries?: number;
  crossOrigin?: string;
  staleTime?: number;
};

export type UseImageSizeOptions = Options & {
  enabled?: boolean;
  keepPreviousData?: boolean;
};

export type Dimensions = {
  width: number;
  height: number;
};

export type UseImageSizeResult = [
  Dimensions | null,
  {
    loading: boolean;
    error: string | null;
    refetch: () => void;
    isPreviousData: boolean;
  }
];
