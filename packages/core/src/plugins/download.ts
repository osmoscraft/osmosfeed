import assert from "assert/strict";
import type { FeedTask } from "../engine/build";
import { getSmartFetch } from "../utils/fetch";
import type { JsonFeed } from "./types";

export interface DownloadExt {
  _download: {
    content: string;
    mediaType: string | null;
  };
}

export function download(): FeedTask<JsonFeed> {
  return async (feed) => {
    assert(feed.feed_url, "feed_url is missing");

    const fetch = getSmartFetch();
    const response = await fetch(feed.feed_url);

    assert(response.ok, `Fetch error, status ${response.status} ${response.statusText}`);

    const ext: DownloadExt = {
      _download: {
        content: await response.text(),
        mediaType: await response.headers.get("Content-Type"),
      },
    };

    return {
      ...feed,
      ...ext,
    };
  };
}
