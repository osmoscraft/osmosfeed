import assert from "assert/strict";
import { readFile } from "fs/promises";
import path from "path";
import type { FeedTask } from "../engine/build";
import { urlToFileString } from "../utils/url";
import type { JsonFeed, JsonFeedItem, TaskContext } from "./types";

export function merge(): FeedTask<JsonFeed, TaskContext> {
  return async (feed, context) => {
    assert(feed.feed_url, "feed_url is missing");
    if (feed.items.length) {
      assert(feed.items[0].date_published, "data_published missing in downloaded feed, will skip merge");
    }

    const remoteFeed = feed;
    const cacheDir = path.join(process.cwd(), context.project.outDir, "cache");
    const cachedFeed = await readCache(feed.feed_url, cacheDir);

    if (cachedFeed?.items.length) {
      assert(cachedFeed.items[0].date_published, "data_published missing in cache, will skip merge");
    }

    const mergeSummary = mergeFeed(mergeItems.bind(null, 100), remoteFeed, cachedFeed);
    console.log(
      `[merge] ${mergeSummary.added - mergeSummary.removed} new | ${
        mergeSummary.unchanged + mergeSummary.updated
      } existing | ${feed.feed_url}`
    );

    return {
      ...mergeSummary.feed,
    };
  };
}

async function readCache(url: string, cacheDir: string): Promise<null | JsonFeed> {
  const filename = `${urlToFileString(url)}.json`;
  const cachePath = path.join(cacheDir, filename);

  try {
    const cache = await readFile(cachePath, "utf-8");
    const parsedCache = JSON.parse(cache);
    return parsedCache;
  } catch (e) {
    return null;
  }
}

function mergeFeed(
  mergeItems: (parsedItems: JsonFeedItem[], cachedItems: JsonFeedItem[]) => MergeItemsSummary,
  remoteFeed: JsonFeed | null,
  cachedFeed: JsonFeed | null
): MergeFeedSummary {
  if (!remoteFeed && !cachedFeed) throw new Error("Cannot merge when both remote and cached feeds are missing");

  const mergeItemsSummary = mergeItems(remoteFeed?.items ?? [], cachedFeed?.items ?? []);

  const mergedFeed: JsonFeed = {
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
  parsedItems: JsonFeedItem[],
  cachedItems: JsonFeedItem[]
): MergeItemsSummary {
  const parsedMap: Map<string, JsonFeedItem> = new Map(parsedItems.map((item) => [item.id, item]));
  const cachedMap: Map<string, JsonFeedItem> = new Map(cachedItems.map((item) => [item.id, item]));

  const addedItems = parsedItems.filter((item) => !cachedMap.has(item.id));
  const updatedItems = parsedItems.filter((item) => cachedMap.has(item.id));
  const unchangedItems = cachedItems.filter((item) => !parsedMap.has(item.id));
  const allItems = [...unchangedItems, ...updatedItems, ...addedItems].sort((a, b) =>
    b.date_published!.localeCompare(a.date_published!)
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
  feed: JsonFeed;
}

interface MergeItemsSummary {
  items: JsonFeedItem[];
  added: number;
  updated: number;
  unchanged: number;
  removed: number;
}
