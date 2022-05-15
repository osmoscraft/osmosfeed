export async function main() {
  const cliArgs = getCliArgs();
  const net = getNet();
  const log = getLog(cliArgs);

  const fileHandles = await readFiles();

  const configHandle = getConfig(fileHandles, defaultConfig);

  const { readCache, writeCache, getAudit } = getAuditedCache(getCache(fileHandles));

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

  await cleanUp(getAudit);
}
