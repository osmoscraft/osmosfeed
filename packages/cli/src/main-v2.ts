import { parse } from "@osmoscraft/json-feed-parser";
import fs from "fs/promises";
import path from "path";
import { exit } from "process";
import { buildFeeds, mergeFeed, mergeItems, normalizeFeed } from "./functions/build-feed";
import { getCache } from "./functions/cache";
import { getProjectConfig } from "./functions/config";
import { executeCopyPlan, getCopyPlan } from "./functions/copy";
import { getSmartFetch } from "./functions/fetch";
import { notNullish } from "./functions/flow";
import { getFileHandles } from "./functions/fs";
import { reportCopy, reportFeedProgress, reportFileDiscovery, reportTemplateRegistration } from "./functions/report";
import { compileTemplates } from "./functions/template";

const CACHE_PATH = "public/cache-v1.json";

export async function main() {
  const fetch = getSmartFetch({
    retry: 3,
    retryDelay: 0, // no delay between retry
    timeout: 10000, // default 10s timeout
    onWillRetry: () => console.log("retry"),
  });

  const userFileHandles = await getFileHandles(path.resolve("."));
  const userConfig = await userFileHandles.find((file) => file.relativePath === "osmosfeed.yaml");
  const projectConfig = await getProjectConfig(notNullish(await userConfig?.text(), "osmosfeed.yaml file not found"));

  const systemFileHandles = await getFileHandles(__dirname);
  const systemStatic = systemFileHandles.filter((handle) => handle.relativePath.startsWith("static"));
  const systemIncludes = systemFileHandles.filter(
    (handle) => handle.relativePath.startsWith("includes") && handle.ext === ".hbs"
  );
  const userStatic = userFileHandles.filter((handle) => handle.relativePath.startsWith("static"));
  const userIncludes = userFileHandles.filter(
    (handle) => handle.relativePath.startsWith("includes") && handle.ext === ".hbs"
  );
  const userCache = userFileHandles.find((file) => file.relativePath === CACHE_PATH);

  reportFileDiscovery({
    systemIncludes,
    systemStatic,
    userIncludes,
    userStatic,
    userCache,
  });

  const cache = getCache(await userCache?.text(), (error) => console.error(`Cache loading error`, error));

  const feeds = await buildFeeds({
    projectConfig,
    cache,
    fetch,
    parse,
    normalize: normalizeFeed,
    merge: mergeFeed.bind(null, mergeItems.bind(null, 100)),
    onProgress: reportFeedProgress,
  });

  await fs.mkdir(path.resolve(path.dirname(CACHE_PATH)), { recursive: true });
  await fs.writeFile(path.resolve(CACHE_PATH), JSON.stringify(feeds));

  const siteSrcHandles = getCopyPlan({
    systemStatic,
    systemIncludes,
    userStatic,
    userIncludes,
    getOutPath: (handle) => (path.resolve("public"), handle.name),
  });

  await executeCopyPlan(siteSrcHandles, reportCopy);

  exit(0);

  const executableTemplate = await compileTemplates({
    templates: userIncludes?.length ? userIncludes : systemIncludes,
    onTemplateRegistered: reportTemplateRegistration,
  });
}
