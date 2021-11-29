import { atomParser, JsonFeed, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import { App } from "@osmoscraft/osmosfeed-web-reader";
import path from "path";
import { loadClient } from "./lib/load-client";
import { loadProject } from "./lib/load-project";
import { log } from "./lib/log";
import { ProgressTracker } from "./lib/progress-tracker";
import { concurrentRequest } from "./lib/concurrent-request";
import { scanDir } from "./lib/scan-dir";
import { concurrentWrite } from "./lib/concurrent-write";
import { isUrl } from "./lib/url";
import { UrlMap } from "./lib/url-map";
import { urlToFilename } from "./lib/url-to-filename";

async function run() {
  const downloadProgress = new ProgressTracker();

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
  downloadProgress.increaseTaskCount(sourceUrls.length);
  const feedRequests = concurrentRequest({
    requests: sourceUrls.map((url) => ({ url })),
    onError: (req) => {
      downloadProgress.increaseProgressCount();
      log.error(`${downloadProgress} error download ${req.url}`);
    },
    onResponse: (req) => {
      downloadProgress.increaseProgressCount();
      log.info(`${downloadProgress} downloaded ${req.url}`);
    },
  });

  const jsonFeeds: JsonFeed[] = [];
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

    const feedItemRequests = feed.items
      .filter((item) => isUrl(item.url))
      .map((item) => ({
        url: item.url!,
      }));
    downloadProgress.increaseTaskCount(feedItemRequests.length);

    const feedItemResponses = concurrentRequest({
      requests: feedItemRequests,
      onResponse: (req, res) => {
        // TODO parse, transform, save crawled items
        downloadProgress.increaseProgressCount();
        log.info(`${downloadProgress} crawled ${req.url}`);
        const cacheFilename = urlToFilename(req.url);
        urlMap.set(req.url, cacheFilename);
      },
    });

    await Promise.all(feedItemResponses);

    jsonFeeds.push(feed);
  });

  await Promise.all(feedResponses);

  log.info("url map size", urlMap.size);

  // TODO add caching and merging logic

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
