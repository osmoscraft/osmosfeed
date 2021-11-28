import { atomParser, JsonFeedChannel, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import { App } from "@osmoscraft/osmosfeed-web-reader";
import path from "path";
import { loadClient } from "./lib/load-client";
import { loadProject } from "./lib/load-project";
import { log } from "./lib/log";
import { progress } from "./lib/progress-tracker";
import { requestFeeds } from "./lib/request-feeds";
import { scanDir } from "./lib/scan-dir";
import { writeProject } from "./lib/write-project";

async function run() {
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
  log.trace("config", project.config.content);

  log.heading("02 Get content");

  const sourceUrls = project.config.content.sources.map((channel) => channel.url ?? channel.href);
  progress.increaseTaskCount(sourceUrls.length);
  const feedResponses = await requestFeeds({
    requests: sourceUrls.map((url) => ({ url })),
    onResponse: (req, res) => {
      progress.increaseProgressCount();
      log.info(`${progress} downloaded ${req.url}`);
    },
  });
  const jsonFeeds: JsonFeedChannel[] = feedResponses.map((rawFeed) => ({
    ...parseFeed({
      xml: rawFeed.text,
      parsers: [rssParser, atomParser],
    }),
    feed_url: rawFeed.url,
  }));

  // TODO add crawling logic

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

  await writeProject([{ fromMemory: html, toPath: path.join(cwd, "dist/index.html") }]);

  log.info(`Site successfully built`);
}

run();
