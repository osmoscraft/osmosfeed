import assert from "assert/strict";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import path, { dirname } from "path";
import type { FeedTask, ProjectTask } from "../engine/build";
import { urlToFileString } from "../utils/url";
import type { JsonFeed, Project, TaskContext } from "./types";
export const JSON_FEED_EXT_PREFIX = "_ext";

export interface CacheExt {
  _cache: JsonFeed;
}

export function readCache(): FeedTask<JsonFeed, TaskContext> {
  return async (feed, context) => {
    assert(feed.feed_url, "feed_url is missing");
    assert(context.project, "project is missing in context");

    const cacheDir = path.join(process.cwd(), context.project.outDir, "cache");

    const filename = `${urlToFileString(feed.feed_url)}.json`;
    const cachePath = path.join(cacheDir, filename);

    try {
      const cache = await readFile(cachePath, "utf-8");
      const parsedCache = JSON.parse(cache) as JsonFeed;

      assert(parsedCache.feed_url === feed.feed_url, "cached feed corrupted");
      assert(Array.isArray(parsedCache.items), "cached feed items missing");
      if (feed.items.length) {
        assert(feed.items[0].date_published, "cached feed missing timestamp");
      }

      const ext: CacheExt = {
        _cache: parsedCache,
      };

      return {
        ...feed,
        ...ext,
      };
    } catch {
      return {
        ...feed,
      };
    }
  };
}

export function writeCache(): FeedTask<JsonFeed, TaskContext> {
  return async (feed, context) => {
    assert(context.project, "project is missing in context");

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

export function pruneCache(): ProjectTask<Project> {
  return async (project) => {
    const cacheDir = path.join(process.cwd(), project.outDir, "cache");

    const keepFiles = project.feeds
      .filter((feed) => feed.feed_url)
      .map((feed) => urlToFileString(feed.feed_url!) + ".json");
    const existingFiles = await readdir(cacheDir);
    const removeFiles = existingFiles.filter((existingFile) => !keepFiles.includes(existingFile));

    await Promise.all(removeFiles.map((removeFile) => rm(path.join(cacheDir, removeFile))));
    console.log(`[cache] removed ${removeFiles.length} unused cache files`);

    return project;
  };
}
