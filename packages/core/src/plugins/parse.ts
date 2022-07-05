import assert from "assert/strict";
import type { FeedTask } from "../engine/build";
import type { DownloadExt } from "./download";
import { parse as parseJsonFeed } from "./parse/json-feed-parser";
import type { JsonFeed } from "./types";

export type ParseItemExt = {
  _extIcon?: string;
};

export function parse(): FeedTask<JsonFeed & ParseItemExt & DownloadExt> {
  return async (feed) => {
    assert(feed._download?.content);

    const jsonFeed = await parseJsonFeed(feed._download.content);
    return {
      ...feed,
      ...{
        ...jsonFeed,
        feed_url: feed.feed_url, // user provided URL is more relevant
      },
    };
  };
}
