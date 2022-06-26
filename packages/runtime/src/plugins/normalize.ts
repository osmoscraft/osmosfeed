import { assert } from "console";
import type { FeedTask } from "../runtime";
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
        date_published: item?.date_published ?? new Date().toISOString(),
      })),
    };

    return {
      ...feed,
      ...normalizedFeed,
    };
  };
}
