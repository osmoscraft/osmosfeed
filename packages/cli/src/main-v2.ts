export async function main() {
  const cliArgs = getCliArgs();
  const net = getNet();
  const log = getLog({ debug: true });

  const fileHandles = await readFiles();

  const configHandle = await getConfig(fileHandles);

  const cacheHandles = getCache(fileHandles);

  const { read: readCache, write: writeCache, audit: auditCache } = audit(cacheHandles);

  const defaultSiteSrc = getBuiltInSiteSrc(fileHandles);
  const userSiteSrc = getUserSiteSrc(fileHandles);
  const siteSrcHandles = getSiteSrc(defaultSiteSrc, userSiteSrc);

  const { writeFile } = getWriter();

  const { feed, buildFeedSummary } = await buildFeed({
    configHandle,
    onFetch: net.get,
    onError: log.error,
    onInfo: log.info,
    onReadCache: readCache,
    onWriteCache: writeCache,
  });

  await buildSite({
    feed,
    configHandle,
    siteSrcHandles,
    buildFeedSummary,
    onError: log.error,
    onInfo: log.info,
    onWrite: writeFile,
  });

  await cleanUp(auditCache);
}

function audit(...args: any[]) {
  return {
    read: () => {
      throw new Error("Function not implemented.");
    },
    write: () => {
      throw new Error("Function not implemented.");
    },
    audit: () => {
      throw new Error("Function not implemented.");
    },
  };
}

function getCliArgs() {
  throw new Error("Function not implemented.");
}

function getNet() {
  return {
    get: () => {
      throw new Error("Function not implemented.");
    },
  };
}

function getLog(arg0: { debug: boolean }) {
  return {
    info: () => {
      throw new Error("Function not implemented.");
    },
    error: () => {
      throw new Error("Function not implemented.");
    },
  };
}

function readFiles() {
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
  onFetch: any;
  onError: any;
  onInfo: any;
  onReadCache: any;
  onWriteCache: any;
}): { feed: any; buildFeedSummary: any } | PromiseLike<{ feed: any; buildFeedSummary: any }> {
  throw new Error("Function not implemented.");
}

function buildSite(arg0: {
  feed: any;
  configHandle: any;
  siteSrcHandles: any;
  buildFeedSummary: any;
  onError: any;
  onInfo: any;
  onWrite: any;
}) {
  throw new Error("Function not implemented.");
}

function cleanUp(getAudit: any) {
  throw new Error("Function not implemented.");
}
