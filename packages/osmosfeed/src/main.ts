import { atomParser, JsonFeed, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import { App } from "@osmoscraft/osmosfeed-web-reader";
import path from "path";
import { loadClient } from "./lib/load-client";
import { loadProject } from "./lib/load-project";
import { log } from "./lib/log";
import { ProgressTracker } from "./lib/progress-tracker";
import { concurrentRequest } from "./lib/concurrent-request";
import { scanDir } from "./lib/scan-dir";
import { concurrentWrite, WriteRequest } from "./lib/concurrent-write";
import { isUrl } from "./lib/url";
import { UrlMap } from "./lib/url-map";
import { urlToFilename } from "./lib/url-to-filename";
import { exists } from "./lib/fs-utils";

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
  const project = await loadProject(projectDir.files);
  const urlMap = new UrlMap(project.urlMapJson);
  log.trace("config", project.config);
  log.trace("url map size", urlMap.size);

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

  const jsonFeeds: JsonFeed[] = [];
  const pagesToCache: WriteRequest[] = [];

  const feedResponses = feedRequests.map(async (download) => {
    const feedData = await download;
    if (!feedData) return;

    const feed: JsonFeed = {
      ...parseFeed({
        xml: feedData.text,
        parsers: [rssParser, atomParser],
      }),
      feed_url: feedData.url,
    };

    // TODO add caching and merging logic
    // request on new items or items without file cache
    // meanwhile, mark unused cache for clean up

    const newFeedItemUrls = await Promise.all(
      feed.items
        .filter((item) => isUrl(item.url))
        .map(async (item) => {
          const hashedFilename = urlMap.get(item.url!);
          // TODO consolidate cache folder path management
          const isCached = await exists(path.join(process.cwd(), `cache/pages/${hashedFilename}.json`));
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
        urlMap.set(req.url, cacheFilename);
        const page = {
          parserVersion: 0, // TODO version system
          html: res.text, // TODO use mercury parser
        };
        pagesToCache.push({ fromMemory: JSON.stringify(page, null, 2), toPath: `cache/pages/${cacheFilename}.json` });
      },
    });

    await Promise.all(feedItemResponses);

    jsonFeeds.push(feed);
  });

  await Promise.all(feedResponses);

  // TODO can be optimized by blend into the download workflow
  await concurrentWrite(pagesToCache);
  log.info(`${pagesToCache.length} new pages saved to cache`);

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

  await concurrentWrite([
    { fromMemory: html, toPath: path.join(cwd, "index.html") },
    { fromMemory: urlMap.toString(), toPath: path.join(cwd, "cache/url-map.json") },
  ]);

  log.info(`Site successfully built`);
}

run();
