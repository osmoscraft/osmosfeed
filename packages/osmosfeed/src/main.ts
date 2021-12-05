import { atomParser, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import type { CachedJsonFeed, ParsedJsonFeed } from "@osmoscraft/osmosfeed-types";
import { App } from "@osmoscraft/osmosfeed-web-reader";
import path from "path";
import { concurrentRequest } from "./lib/concurrent-request";
import { concurrentWrite, WriteRequest } from "./lib/concurrent-write";
import { exists } from "./lib/fs-utils";
import { loadClient } from "./lib/load-client";
import { loadProject } from "./lib/load-project";
import { log } from "./lib/log";
import { mergeJsonFeed } from "./lib/merge";
import { ProgressTracker } from "./lib/progress-tracker";
import { scanDir } from "./lib/scan-dir";
import { isUrl } from "./lib/url";
import { urlToFilename } from "./lib/url-to-filename";

async function run() {
  const progressTracker = new ProgressTracker();

  log.heading("01 Load files");

  const clientDir = await scanDir(path.resolve(__dirname, "client/"));
  const client = await loadClient(clientDir.files, clientDir.root);
  log.trace(
    "client files",
    client.files.map((file) => file.metadata.path)
  );

  const cwd = process.cwd();
  log.trace("cwd", cwd);

  const projectDir = await scanDir(cwd);
  const project = await loadProject(projectDir.files, projectDir.root);
  log.trace("config", project.config);

  // TODO load cache separately from project. Unlike project files, cache is highly mutable

  log.heading("02 Fetch and parse feeds");

  const sourceUrls = project.config.sources.map((channel) => channel.url ?? channel.href);
  progressTracker.increaseTaskCount(sourceUrls.length);
  const feedRequests = concurrentRequest({
    requests: sourceUrls.map((url) => ({ url })),
    onError: (req) => {
      progressTracker.increaseProgressCount();
      log.error(`${progressTracker} error download ${req.url}`);
    },
    onResponse: (req) => {
      progressTracker.increaseProgressCount();
      log.info(`${progressTracker} downloaded ${req.url}`);
    },
  });

  const jsonFeeds: CachedJsonFeed[] = [];
  const feedsToCache: WriteRequest[] = [];

  const feedResponses = feedRequests.map(async (download) => {
    const feedData = await download;
    if (!feedData) return;

    const feed: ParsedJsonFeed = {
      ...parseFeed({
        xml: feedData.text,
        parsers: [rssParser, atomParser],
      }),
      feed_url: feedData.url,
    };

    // TODO this should be generated after making all network requests to filter out broken urls
    const existingCachedFeed = project.cachedFeeds.find((feed) => feed.feed_url! == feedData.url);
    const cacheableFeed: CachedJsonFeed = {
      ...feed,
      _ext_cache: {
        pkg_version: "", // TODO implement,
        cache_key: urlToFilename(feedData.url),
      },
      items: feed.items.map((item) => ({
        ...item,
        _ext_cache: {
          pkg_version: "", // TODO implement
          cache_key: item.url ? urlToFilename(item.url) : undefined,
        },
      })),
    };
    const mergedFeed = existingCachedFeed ? mergeJsonFeed(cacheableFeed, existingCachedFeed) : cacheableFeed;

    const newFeedItemUrls = await Promise.all(
      mergedFeed.items
        .filter((item) => isUrl(item.url))
        .map(async (item) => {
          const hashedFilename = item._ext_cache.cache_key;
          const isCached = await exists(path.join(process.cwd(), `cache/pages/${hashedFilename}.html`));
          progressTracker.increaseTaskCount();
          if (isCached) {
            progressTracker.increaseProgressCount();
            log.info(`${progressTracker} already cached ${item.url}`);
            return undefined;
          } else {
            return item.url;
          }
        })
    );

    const feedItemRequests = newFeedItemUrls
      .filter((maybeUrl) => !!maybeUrl)
      .map((url) => ({
        url: url!,
      }));

    const feedItemResponses = concurrentRequest({
      requests: feedItemRequests,
      onResponse: async (req, res) => {
        progressTracker.increaseProgressCount();
        log.info(`${progressTracker} crawled ${req.url}`);
        const cacheFilename = urlToFilename(req.url);
        const html = res.text; // TODO strip javascript and stylesheet, maybe convert with mercury parser (otherwise use client side conversion)
        const cacheWriteRequest = {
          fromMemory: html,
          toPath: `cache/pages/${cacheFilename}.html`,
        };
        await concurrentWrite([cacheWriteRequest]);
      },
    });

    await Promise.all(feedItemResponses);

    jsonFeeds.push(mergedFeed);
    const feedCacheName = urlToFilename(feedData.url);
    feedsToCache.push({
      fromMemory: JSON.stringify(mergedFeed, null, 2),
      toPath: `cache/feeds/${feedCacheName}.json`,
    });
  });

  await Promise.all(feedResponses);

  // TODO remove unused page cache
  // TODO remove unused feed cache
  await concurrentWrite(feedsToCache);

  log.heading("03 Generate site");

  const html = App({
    data: jsonFeeds,
    embeddedScripts: client.files
      .filter((file) => path.join("/", file.relativePath) === "/index.js")
      .map((file) => ({ content: file.content })),
    embeddedStylesheets: client.files
      .filter((file) => path.join("/", file.relativePath) === "/index.css")
      .map((file) => ({ content: file.content })),
    embeddedFavicon: client.files
      .filter((file) => path.join("/", file.relativePath) === "/favicon.png")
      .map((file) => ({ content: file.content, mime: file.metadata.mime! }))?.[0],
  });

  await concurrentWrite([{ fromMemory: html, toPath: path.join(cwd, "index.html") }]);

  log.info(`Site successfully built`);
}

run();
