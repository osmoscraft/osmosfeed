import assert from "assert";
import { readFile } from "fs/promises";
import path from "path";
import type { FeedTask } from "../runtime";
import { urlToFilename } from "../utils/url";
import type { NormalizeExt, NormalizeItemExt } from "./normalize";
import type { JsonFeed, JsonFeedItem } from "./types";

type NormalizedFeed = JsonFeed & NormalizeExt;
type NormalizedItem = JsonFeedItem & NormalizeItemExt;

export function merge(): FeedTask<JsonFeed & NormalizeExt> {
  return async (feed) => {
    assert(feed.feed_url, "feed_url is missing");

    const remoteFeed = feed;
    const cachedFeed = await readCache(feed.feed_url);

    const mergeSummary = mergeFeed(mergeItems.bind(null, 100), remoteFeed, cachedFeed);
    // TODO report merge summary

    return {
      ...mergeSummary.feed,
    };
  };
}

async function readCache(url: string): Promise<null | NormalizedFeed> {
  const filename = `${urlToFilename(url)}.json`;
  const cachePath = path.join(process.cwd(), "dist/cache", filename);

  try {
    const cache = await readFile(cachePath, "utf-8");
    const parsedCache = JSON.parse(cache);
    return parsedCache;
  } catch (e) {
    return null;
  }
}

function mergeFeed(
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

function mergeItems(
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

interface MergeFeedSummary extends MergeItemsSummary {
  feed: NormalizedFeed;
}

interface MergeItemsSummary {
  items: NormalizedItem[];
  added: number;
  updated: number;
  unchanged: number;
  removed: number;
}
