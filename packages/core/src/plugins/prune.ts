import { readdir, rm } from "fs/promises";
import path from "path";
import type { ProjectTask } from "../engine/build";
import { urlToFileString } from "../utils/url";
import type { Project } from "./types";

export function prune(): ProjectTask<Project> {
  return async (project) => {
    const cacheDir = path.join(process.cwd(), project.outDir, "cache");

    const keepFiles = project.feeds
      .filter((feed) => feed.feed_url)
      .map((feed) => urlToFileString(feed.feed_url!) + ".json");
    const existingFiles = await readdir(cacheDir);
    const removeFiles = existingFiles.filter((existingFile) => !keepFiles.includes(existingFile));

    if (removeFiles.length) {
      console.log(`[prune] remove ${removeFiles.length} unused cache files`);
      await Promise.all(removeFiles.map((removeFile) => rm(path.join(cacheDir, removeFile))));
    } else {
      console.log(`[prune] nothing to prune`);
    }

    return project;
  };
}
