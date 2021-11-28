import { atomParser, JsonFeedChannel, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import { App } from "@osmoscraft/osmosfeed-web-reader";
import path from "path";
import { loadClient } from "./lib/load-client";
import { loadProject } from "./lib/load-project";
import { requestFeeds } from "./lib/request-feeds";
import { scanDir } from "./lib/scan-dir";
import { writeProject } from "./lib/write-project";

async function run() {
  const clientDir = await scanDir(path.resolve(__dirname, "client/"));
  const client = await loadClient(clientDir.files, clientDir.root);

  const cwd = process.cwd();
  const projectDir = await scanDir(cwd);

  const project = await loadProject(projectDir.files);
  const feedUrls = project.config.content.channels.map((channel) => channel.url);

  console.log("feed url: ", feedUrls);

  const feedResponses = await requestFeeds(feedUrls.map((url) => ({ url })));
  const jsonFeeds: JsonFeedChannel[] = feedResponses.map((rawFeed) => ({
    ...parseFeed({
      xml: rawFeed.textResponse,
      parsers: [rssParser, atomParser],
    }),
    feed_url: rawFeed.feedUrl,
  }));

  console.log("downloaded: ", jsonFeeds.length);

  // TODO add crawling logic

  // TODO add caching and merging logic

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
}

run();
