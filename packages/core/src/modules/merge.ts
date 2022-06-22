import { asError, extractError, undefinedAsError } from "../utils/error";
import type { MergeFeedSummary, MergeItemsSummary, NormalizedFeed, NormalizedItem, PipeFeed } from "./types";

export function useMerge(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [normalizedFeed, normalizedFeedError] = extractError(undefinedAsError(feed.normalizedFeed));
    const [cacheRead, cacheReadError] = extractError(undefinedAsError(feed.cacheRead));

    const remoteFeed = normalizedFeedError ? null : normalizedFeed;
    const cachedFeed = cacheReadError ? null : cacheRead;

    if (remoteFeed === null && cachedFeed === null) {
      return {
        ...feed,
        mergedFeed: new Error("Both cached and remote feed are missing"),
      };
    }

    try {
      const mergeSummary = mergeFeed(mergeItems.bind(null, 100), remoteFeed, cachedFeed);
      return {
        ...feed,
        mergedFeed: mergeSummary,
      };
    } catch (e) {
      return {
        ...feed,
        mergedFeed: asError(e),
      };
    }
  };
}

export function mergeFeed(
  mergeItems: (parsedItems: NormalizedItem[], cachedItems: NormalizedItem[]) => MergeItemsSummary,
  remoteFeed: NormalizedFeed | null,
  cachedFeed: NormalizedFeed | null
): MergeFeedSummary {
  if (!remoteFeed && !cachedFeed) throw new Error("Cannot merge when both remote and cached feeds are missing");

  const mergeItemsSummary = mergeItems(remoteFeed?.items ?? [], cachedFeed?.items ?? []);

  const mergedFeed: NormalizedFeed = {
    ...(remoteFeed ?? cachedFeed!), // we have checked at least one of them exist
    items: mergeItemsSummary.items,
  };

  return {
    feed: mergedFeed,
    ...mergeItemsSummary,
  };
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
