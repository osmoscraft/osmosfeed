import type { JsonFeed } from "@osmoscraft/osmosfeed-types";

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import * as uuid from "uuid"; // TODO implement v5 without lib

import path from "path";

export interface JsonFeedCacheProvider {
  (...args: any[]): {
    read: () => Promise<JsonFeed[]>;
    write: (jsonFeeds: JsonFeed[]) => Promise<void>;
  };
}

export const localJsonFeedCacheProvider: JsonFeedCacheProvider = (cacheInputDir: string, cacheOutputDir?: string) => {
  const cacheInputFullDir = path.join(process.cwd(), cacheInputDir);
  const cacheOutputFullDir = cacheOutputDir ? path.join(process.cwd(), cacheOutputDir) : cacheInputFullDir;

  const read = async () => {
    const cacheFilenames = await getFilenamesSafe(cacheInputFullDir);
    const jsonFeedList = (
      await Promise.all(
        cacheFilenames.map((filename) => readJsonSafe<JsonFeed>(path.join(cacheInputFullDir, filename)))
      )
    ).filter(ensureNotNull);

    return jsonFeedList;
  };

  // TODO implement clean up to remove cache based on a feedUrl list
  const cleanUrls = async (feedUrls: string[]) => {};
  const cleanAll = async () => {};

  const write = async (jsonFeeds: JsonFeed[]) => {
    const filesToWrite = jsonFeeds.map((jsonFeed) => ({
      filename: uuid.v5(jsonFeed.feed_url!, uuid.v5.URL) + ".json",
      fileContent: JSON.stringify(jsonFeed),
    }));

    console.log(`[local-cache-provider] ${filesToWrite.length} files to write to cache`);

    // TODO ensure dir
    await mkdir(cacheOutputFullDir, { recursive: true });

    // TODO error handling
    await Promise.all(
      filesToWrite.map(async (file) =>
        writeFile(path.join(cacheOutputFullDir, file.filename), file.fileContent, "utf-8")
      )
    );
  };

  return {
    read,
    write,
  };
};

async function readJsonSafe<T = any>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, "utf-8"));
  } catch {
    return null;
  }
}

async function getFilenamesSafe(dir: string): Promise<string[]> {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

function ensureNotNull<T>(maybeNull: T | null): maybeNull is T {
  return maybeNull !== null;
}
