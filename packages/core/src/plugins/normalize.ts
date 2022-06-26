import assert from "assert";
import type { FeedTask } from "../runtime";
import { resolveRelativeUrl } from "../utils/url";
import type { JsonFeed, JsonFeedItem } from "./types";

export interface NormalizeExt {
  items: (JsonFeedItem & NormalizeItemExt)[];
}

export interface NormalizeItemExt {
  date_published: string;
}

export function normalize(): FeedTask<JsonFeed> {
  return async (feed) => {
    assert(feed.feed_url, "feed_url is missing");

    const normalizedFeed: NormalizeExt = {
      items: feed.items.map((item) => ({
        ...item,
        url: item?.url ? resolveRelativeUrl(item?.url, feed.feed_url!) ?? undefined : undefined,
        image: item?.image ? resolveRelativeUrl(item?.image, feed.feed_url!) ?? undefined : undefined,
        date_published: item?.date_published ?? new Date().toISOString(),
      })),
    };

    return {
      ...feed,
      ...normalizedFeed,
    };
  };
}
