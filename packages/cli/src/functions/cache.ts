import type { JsonFeed, JsonFeedItem } from "@osmoscraft/json-feed-types";

export type Cache = Map<string, NormalizedFeed>;
export type NormalizedFeed = JsonFeed<{ feed_url: string }, { date_published: string }>;
export type NormalizedItem = JsonFeedItem<{ date_published: string }>;

export function getCache(cacheText?: string, onError?: (error: unknown) => any): Cache {
  if (!cacheText) {
    return new Map();
  }

  try {
    const parsedCache = JSON.parse(cacheText);
    if (!Array.isArray(parsedCache)) {
      throw new Error(`"sources" field is not an array`);
    }
    return new Map((parsedCache as NormalizedFeed[]).map((source) => [source.feed_url, source]));
  } catch (error) {
    onError?.(error);
    return new Map();
  }
}
