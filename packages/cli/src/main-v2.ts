import { getSmartFetch } from "./functions/fetch";

export async function main() {
  const fetch = getSmartFetch({
    retry: 3,
    retryDelay: 0, // no delay between retry
    timeout: 10000, // default 10s timeout
    onWillRetry: () => console.log("retry"),
  });

  const fileHandles = await getFileHandles();
  const configHandle = await getConfig(fileHandles);
  const cacheHandle = getCache(fileHandles);

  const defaultSiteSrc = getBuiltInSiteSrc(fileHandles);
  const userSiteSrc = getUserSiteSrc(fileHandles);
  const siteSrcHandles = getSiteSrc(defaultSiteSrc, userSiteSrc);

  const { feed, buildFeedSummary } = await buildFeed({
    configHandle,
    cacheHandle,
    onFetch: fetch,
    onError: console.error,
    onInfo: console.log,
  });

  await writeCache(feed);

  const site = await buildSite({
    feed,
    configHandle,
    siteSrcHandles,
    buildFeedSummary,
    onError: console.error,
    onInfo: console.log,
  });

  await writeSite({
    site,
  });
}

function getFileHandles() {
  throw new Error("Function not implemented.");
}

function getConfig(fileHandles: any) {
  throw new Error("Function not implemented.");
}

function getCache(fileHandles: any) {
  throw new Error("Function not implemented.");
}

function getBuiltInSiteSrc(fileHandles: any) {
  throw new Error("Function not implemented.");
}

function getUserSiteSrc(fileHandles: any) {
  throw new Error("Function not implemented.");
}

function getSiteSrc(defaultSiteSrc: any, userSiteSrc: any) {
  throw new Error("Function not implemented.");
}

function getWriter(): { writeFile: any } {
  throw new Error("Function not implemented.");
}

function buildFeed(arg0: {
  configHandle: any;
  cacheHandle: any;
  onFetch: any;
  onError: any;
  onInfo: any;
}): Promise<any> {
  throw new Error("Function not implemented.");
}

function buildSite(arg0: {
  feed: any;
  configHandle: any;
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
