import type { JsonFeed } from "@osmoscraft/json-feed-types";
import type { Cache, NormalizedFeed, NormalizedItem } from "./cache";
import type { ProjectConfig } from "./config";

export interface FeedBuilderConfig {
  projectConfig: ProjectConfig;
  cache: Cache;
  fetch: (url: string) => Promise<Response>;
  parse: (xml: string) => Promise<JsonFeed>;
  normalize: (rawFeed: JsonFeed, feedUrl: string) => NormalizedFeed;
  merge: (parsedFeed: NormalizedFeed, cachedFeed?: NormalizedFeed) => MergeFeedSummary;
  onProgress?: (progress: FeedProgress) => any;
}

export interface FeedProgress extends MergeFeedSummary {
  url: string;
  duration: number;
}

export async function buildFeeds(config: FeedBuilderConfig) {
  const allFeeds = await Promise.all(
    config.projectConfig.sources.map(async (source) => {
      const start = performance.now();

      const response = await fetch(source.url);
      const xml = await response.text();
      const parsedFeed = await config.parse(xml);
      const normalizedFeed = config.normalize(parsedFeed, source.url);
      const cachedFeed = config.cache.get(source.url);
      const mergeSummary = config.merge(normalizedFeed, cachedFeed);

      config.onProgress?.({
        url: source.url,
        duration: performance.now() - start,
        ...mergeSummary,
      });

      return mergeSummary.feed;
    })
  );

  return allFeeds;
}

export function normalizeFeed(rawFeed: JsonFeed, feedUrl: string): NormalizedFeed {
  return {
    ...rawFeed,
    feed_url: feedUrl,
    items: rawFeed.items.map((item) => ({
      ...item,
      date_published: item?.date_published ?? new Date().toISOString(),
    })),
  };
}

export interface MergeFeedSummary extends MergeItemsSummary {
  feed: NormalizedFeed;
}

export function mergeFeed(
  mergeItems: (parsedItems: NormalizedItem[], cachedItems: NormalizedItem[]) => MergeItemsSummary,
  parsedFeed: NormalizedFeed,
  cachedFeed?: NormalizedFeed
): MergeFeedSummary {
  const mergeItemsSummary = mergeItems(parsedFeed.items, cachedFeed?.items ?? []);

  const mergedFeed: NormalizedFeed = {
    ...parsedFeed, // always use metadata from parsed feed
    items: mergeItemsSummary.items,
  };

  return {
    feed: mergedFeed,
    ...mergeItemsSummary,
  };
}

export interface MergeItemsSummary {
  items: NormalizedItem[];
  added: number;
  updated: number;
  unchanged: number;
  removed: number;
}

export function mergeItems(
  limit: number | undefined,
  parsedItems: NormalizedItem[],
  cachedItems: NormalizedItem[]
): MergeItemsSummary {
  const parsedMap: Map<string, NormalizedItem> = new Map(parsedItems.map((item) => [item.id, item]));
  const cachedMap: Map<string, NormalizedItem> = new Map(cachedItems.map((item) => [item.id, item]));

  const addedItems = parsedItems.filter((item) => !cachedMap.has(item.id));
  const updatedItems = parsedItems.filter((item) => cachedMap.has(item.id));
  const unchangedItems = cachedItems.filter((item) => !parsedMap.has(item.id));
  const allItems = [...unchangedItems, ...updatedItems, ...addedItems].sort((a, b) =>
    b.date_published.localeCompare(a.date_published)
  );
  const remainingItems = allItems.slice(0, limit);

  return {
    items: remainingItems,
    added: addedItems.length,
    updated: updatedItems.length,
    unchanged: unchangedItems.length,
    removed: allItems.length - remainingItems.length,
  };
}
