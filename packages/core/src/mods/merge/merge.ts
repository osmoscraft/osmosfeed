import { extractError, undefinedAsError } from "../../utils/error";
import type { NormalizedFeed, NormalizedItem, PipeFeed } from "../types";

export function useMerge(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [normalizedFeed, normalizedFeedError] = extractError(undefinedAsError(feed.normalizedFeed));

    // TODO
    // cache OK, feed ERR => reuse cache
    // cache OK, feed OK => merge
    // cache BAD, feed OK => use feed
    // cache BAD, feed BAD => error

    return feed;
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
