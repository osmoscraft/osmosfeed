import { mkdir, readFile, writeFile } from "fs/promises";
import path, { dirname } from "path";
import process from "process";
import { asError, extractError, undefinedAsError } from "../utils/error";
import { urlToFilename } from "../utils/url";
import type { PipeFeed } from "./types";

export function useCacheReader(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [config, configError] = extractError(undefinedAsError(feed.config));
    if (configError) return feed;

    const filename = `${urlToFilename(config.url)}.json`;
    const cachePath = path.join(process.cwd(), "dist/cache", filename);

    try {
      const cache = await readFile(cachePath, "utf-8");
      const parsedCache = JSON.parse(cache);
      return {
        ...feed,
        cacheRead: parsedCache,
      };
    } catch (e) {
      if ((e as any).code === "ENOENT")
        return {
          ...feed,
          cacheRead: null,
        };

      return {
        ...feed,
        cacheRead: asError(e),
      };
    }
  };
}

export function useCacheWriter(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [config, configError] = extractError(undefinedAsError(feed.config));
    if (configError) return feed;

    const [mergedFeed, mergedFeedError] = extractError(undefinedAsError(feed.mergedFeed));
    if (mergedFeedError) return feed;

    try {
      const filename = `${urlToFilename(config.url)}.json`;
      const cachePath = path.join(process.cwd(), "dist/cache", filename);
      await mkdir(dirname(cachePath), { recursive: true });
      await writeFile(cachePath, JSON.stringify(mergedFeed));

      return {
        ...feed,
        cacheWrite: filename,
      };
    } catch (e) {
      return {
        ...feed,
        cacheWrite: asError(e),
      };
    }
  };
}
