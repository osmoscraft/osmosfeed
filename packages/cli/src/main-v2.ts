import path from "path";
import { exit } from "process";
import { getCache } from "./functions/cache";
import { getConfig } from "./functions/config";
import { getSmartFetch } from "./functions/fetch";
import { notNullish } from "./functions/flow";
import { getFileHandles } from "./functions/fs";

export async function main() {
  const fetch = getSmartFetch({
    retry: 3,
    retryDelay: 0, // no delay between retry
    timeout: 10000, // default 10s timeout
    onWillRetry: () => console.log("retry"),
  });

  const userFileHandles = await getFileHandles(path.resolve("."));
  const userConfig = await userFileHandles.find((file) => file.relativePath === "osmosfeed.yaml");
  const config = await getConfig(notNullish(await userConfig?.read().text(), "osmosfeed.yaml file not found"));

  const systemFileHandles = await getFileHandles(__dirname);
  const systemPublic = systemFileHandles.filter((handle) => handle.relativePath.startsWith("public"));
  const systemIncludes = systemFileHandles.filter((handle) => handle.relativePath.startsWith("includes"));
  const userPublic = userFileHandles.filter((handle) => handle.relativePath.startsWith("public"));
  const userIncludes = userFileHandles.filter((handle) => handle.relativePath.startsWith("includes"));
  const userCache = userFileHandles.find((file) => file.relativePath === "cache.json");

  const cache = getCache(await userCache?.read().text(), (error) => console.error(`Cache loading error`, error));

  const siteSrcHandles = getSiteSrc(systemPublic, systemIncludes, userPublic, userIncludes);

  console.log(config);
  (() => exit(0))();

  const { feed, buildFeedSummary } = await buildFeed({
    config,
    cache,
    onFetch: fetch,
    onError: console.error,
    onInfo: console.log,
  });

  await writeCache(feed);

  const site = await buildSite({
    feed,
    config,
    siteSrcHandles,
    buildFeedSummary,
    onError: console.error,
    onInfo: console.log,
  });

  await writeSite({
    site,
  });
}

function getBuiltInSiteSrc(fileHandles: any) {
  throw new Error("Function not implemented.");
}

function getUserSiteSrc(fileHandles: any) {
  throw new Error("Function not implemented.");
}

function getSiteSrc(...args: any[]) {
  throw new Error("Function not implemented.");
}

function getWriter(): { writeFile: any } {
  throw new Error("Function not implemented.");
}

function buildFeed(arg0: any): Promise<any> {
  throw new Error("Function not implemented.");
}

function buildSite(arg0: {
  feed: any;
  config: any;
  siteSrcHandles: any;
  buildFeedSummary: any;
  onError: any;
  onInfo: any;
}) {
  throw new Error("Function not implemented.");
}

function cleanUp(getAudit: any) {
  throw new Error("Function not implemented.");
}
function writeCache(feed: any) {
  throw new Error("Function not implemented.");
}
function writeSite(arg0: { site: void }) {
  throw new Error("Function not implemented.");
}
