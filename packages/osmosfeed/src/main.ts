import { atomParser, JsonFeedChannel, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import { App } from "@osmoscraft/osmosfeed-web-reader";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { copyDirRecursive } from "./lib/fs-utils";
import { loadProject } from "./lib/load-project";
import { request } from "./lib/request";
import { scanDir } from "./lib/scan-dir";

async function run() {
  // TODO refactor into a client loader, similar to the project loader
  const clientAssetDir = path.resolve(__dirname, "client/");
  console.log(clientAssetDir);

  const cwd = process.cwd();
  const projectDir = await scanDir(cwd);

  console.log("project dir", projectDir);

  const project = await loadProject(projectDir.files);
  const feedUrls = project.config.content.channels.map((channel) => channel.url);

  console.log("feed url: ", feedUrls);

  // TODO encapsulate
  const rawFeeds = await Promise.all(
    feedUrls.map(async (feedUrl) => {
      const { raw } = await request(feedUrl);
      return {
        feedUrl,
        textResponse: raw, // TODO error status handling
      };
    })
  );

  const jsonFeeds: JsonFeedChannel[] = rawFeeds.map((rawFeed) => ({
    ...parseFeed({
      xml: rawFeed.textResponse,
      parsers: [rssParser, atomParser],
    }),
    feed_url: rawFeed.feedUrl,
  }));

  console.log("downloaded: ", jsonFeeds.length);

  const html = App({
    data: jsonFeeds,
    assets: [
      { type: "script", href: "assets/index.js" },
      { type: "stylesheet", href: "assets/index.css" },
    ],
  });

  // TODO encapsulate
  await mkdir(path.join(cwd, "dist"));
  await writeFile(path.join(cwd, "dist/index.html"), html);
  await copyDirRecursive(clientAssetDir, path.join(cwd, "dist/assets"));
}

run();
