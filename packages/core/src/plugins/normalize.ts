import assert from "assert/strict";
import type { FeedTask } from "../engine/build";
import { getIsoTimeZeroOffset } from "../utils/time";
import { resolveRelativeUrl } from "../utils/url";
import type { JsonFeed } from "./types";

export function normalize(): FeedTask<JsonFeed> {
  return async (feed) => {
    assert(feed.feed_url, "feed_url is missing");

    const normalizedFeed: JsonFeed = {
      ...feed,
      items: feed.items.map((item) => {
        const normalizedDatePublished = item?.date_published
          ? getIsoTimeZeroOffset(item.date_published)
          : new Date().toISOString();
        const normalizedDateModified = item?.date_modified
          ? getIsoTimeZeroOffset(item.date_modified)
          : normalizedDatePublished;

        return {
          ...item,
          url: item?.url ? resolveRelativeUrl(item?.url, feed.feed_url!) ?? undefined : undefined,
          image: item?.image ? resolveRelativeUrl(item?.image, feed.feed_url!) ?? undefined : undefined,
          date_published: normalizedDatePublished,
          date_modified: normalizedDateModified,
        };
      }),
    };

    return normalizedFeed;
  };
}
