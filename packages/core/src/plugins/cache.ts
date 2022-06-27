import assert from "assert/strict";
import { mkdir, writeFile } from "fs/promises";
import path, { dirname } from "path";
import type { FeedTask } from "../engine/build";
import { urlToFileString } from "../utils/url";
import type { JsonFeed, TaskContext } from "./types";

export const JSON_FEED_EXT_PREFIX = "_ext";

export function cache(): FeedTask<JsonFeed, TaskContext> {
  return async (feed, context) => {
    const cacheDir = path.join(process.cwd(), context.project.outDir, "cache");

    if (!feed.items.length) return feed; // noop for empty feed
    assert(feed.feed_url, "feed_url missing");
    assert(feed.items[0].date_published, "date_publish missing, will skip cache");

    const filename = `${urlToFileString(feed.feed_url)}.json`;
    const cachePath = path.join(cacheDir, filename);
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(
      cachePath,
      JSON.stringify(
        feed,
        (key, value) => {
          // omit all custom fields
          if (key.startsWith("_") && !key.startsWith(JSON_FEED_EXT_PREFIX)) return undefined;
          return value;
        },
        2
      )
    );

    return feed;
  };
}
