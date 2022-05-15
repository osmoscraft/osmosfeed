export interface Cache {
  sources: any[];
}

export function getCache(cacheText?: string, onError?: (error: unknown) => any): Cache {
  if (!cacheText) {
    return EMPTY_CACHE;
  }

  try {
    const parsedCache = JSON.parse(cacheText);
    if (!Array.isArray(parsedCache.sources)) {
      throw new Error(`"sources" field is not an array`);
    }

    return parsedCache;
  } catch (error) {
    onError?.(error);
    return EMPTY_CACHE;
  }
}

const EMPTY_CACHE: Cache = {
  sources: [],
};
