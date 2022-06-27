import assert from "assert/strict";
import { mkdir, writeFile } from "fs/promises";
import path, { dirname } from "path";
import type { FeedTask } from "../engine/build";
import { pkg } from "../utils/pkg";
import { urlToFileString } from "../utils/url";
import type { JsonFeed, TaskContext } from "./types";

export interface CachedFeedExt {
  _extGeneratorVersion: string;
}

export const JSON_FEED_EXT_PREFIX = "_ext";

export function cache(): FeedTask<JsonFeed, TaskContext> {
  return async (feed, context) => {
    const cacheDir = path.join(process.cwd(), context.project.outDir, "cache");

    const ext: CachedFeedExt = {
      _extGeneratorVersion: pkg.version,
    };
    const cachedFeed = {
      ...feed,
      ...ext,
    };

    if (!cachedFeed.items.length) return feed; // noop for empty feed
    assert(cachedFeed.feed_url, "feed_url missing");
    assert(cachedFeed.items[0].date_published, "date_publish missing, will skip cache");

    const filename = `${urlToFileString(cachedFeed.feed_url)}.json`;
    const cachePath = path.join(cacheDir, filename);
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(
      cachePath,
      JSON.stringify(
        cachedFeed,
        (key, value) => {
          // omit all custom fields
          if (key.startsWith("_") && !key.startsWith(JSON_FEED_EXT_PREFIX)) return undefined;
          return value;
        },
        2
      )
    );

    return cachedFeed;
  };
}
