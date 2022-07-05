import assert from "assert/strict";
import type { ItemTask } from "../engine/build";
import { getIsoTimeZeroOffset } from "../utils/time";
import { resolveRelativeUrl } from "../utils/url";
import type { CrawlItemExt } from "./crawl";
import type { JsonFeedItem, TaskContext } from "./types";

export function normalizeItem(): ItemTask<JsonFeedItem & CrawlItemExt, TaskContext> {
  return async (item, context) => {
    assert(context.feed?.feed_url, "feed_url is missing in context");

    const normalizedDatePublished = item?.date_published
      ? getIsoTimeZeroOffset(item.date_published)
      : new Date().toISOString();
    const normalizedDateModified = item?.date_modified
      ? getIsoTimeZeroOffset(item.date_modified)
      : normalizedDatePublished;

    const isCrawlDescriptionBetter =
      item._extCrawl?.description && item._extCrawl?.description?.length > 5 * (item.summary?.length ?? 0);

    return {
      ...item,
      url: item?.url ? resolveRelativeUrl(item?.url, context.feed.feed_url!) ?? undefined : undefined,
      summary: isCrawlDescriptionBetter ? item._extCrawl?.description : item.summary,
      image: item?.image
        ? resolveRelativeUrl(item?.image, context.feed.feed_url!) ?? item._extCrawl?.image ?? undefined
        : undefined,
      date_published: normalizedDatePublished,
      date_modified: normalizedDateModified,
    };
  };
}
