import assert from "assert/strict";
import { mkdir, writeFile } from "fs/promises";
import path, { dirname } from "path";
import type { FeedTask } from "../engine/build";
import { urlToFilename } from "../utils/url";
import type { JsonFeed } from "./types";

export const CACHE_DIR = path.join(process.cwd(), "dist/cache");

export function cache(): FeedTask<JsonFeed> {
  return async (feed) => {
    if (!feed.items.length) return feed; // noop for empty feed
    assert(feed.feed_url, "feed_url missing");
    assert(feed.items[0].date_published, "date_publish missing, will skip cache");

    const filename = `${urlToFilename(feed.feed_url)}.json`;
    const cachePath = path.join(CACHE_DIR, filename);
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(
      cachePath,
      JSON.stringify(
        feed,
        (key, value) => {
          // omit all custom fields
          if (key.startsWith("_")) return undefined;
          return value;
        },
        2
      )
    );

    return feed;
  };
}
