import { JsonFeed } from "../utils/parse-feed";

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import * as uuid from "uuid"; // TODO implement v5 without lib

import path from "path";

export interface JsonFeedCacheProvider {
  (...args: any[]): {
    read: () => Promise<JsonFeed[]>;
    write: (jsonFeeds: JsonFeed[]) => Promise<void>;
  };
}

export const localJsonFeedCacheProvider: JsonFeedCacheProvider = (cacheDirRelativeToCwd: string) => {
  const cacheDir = path.join(process.cwd(), cacheDirRelativeToCwd);

  const read = async () => {
    const cacheFilenames = await getFilenamesSafe(cacheDir);
    const jsonFeedList = (
      await Promise.all(cacheFilenames.map((filename) => readJsonSafe<JsonFeed>(path.join(cacheDir, filename))))
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

    console.log(filesToWrite);

    // TODO ensure dir
    await mkdir(cacheDir, { recursive: true });

    // TODO error handling
    await Promise.all(
      filesToWrite.map(async (file) => writeFile(path.join(cacheDir, file.filename), file.fileContent, "utf-8"))
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
