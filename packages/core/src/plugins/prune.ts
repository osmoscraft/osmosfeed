import { readdir, rm } from "fs/promises";
import path from "path";
import type { ProjectTask } from "../engine/build";
import { urlToFileString } from "../utils/url";
import { CACHE_DIR } from "./cache";
import type { Project } from "./types";

export function prune(): ProjectTask<Project> {
  return async (project) => {
    const keepFiles = project.feeds
      .filter((feed) => feed.feed_url)
      .map((feed) => urlToFileString(feed.feed_url!) + ".json");
    const existingFiles = await readCacheDir();
    const removeFiles = existingFiles.filter((existingFile) => !keepFiles.includes(existingFile));

    if (removeFiles.length) {
      console.log(`[prune] remove ${removeFiles.length} unused cache files`);
      await Promise.all(removeFiles.map((removeFile) => rm(path.join(CACHE_DIR, removeFile))));
    } else {
      console.log(`[prune] nothing to prune`);
    }

    return project;
  };
}

async function readCacheDir() {
  const cacheDir = path.join(CACHE_DIR);
  const cachedFiles = await readdir(cacheDir);
  return cachedFiles;
}
