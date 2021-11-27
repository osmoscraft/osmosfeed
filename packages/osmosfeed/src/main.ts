import { loadProject } from "./lib/load-project";
import { request } from "./lib/request";
import { JsonFeedChannel, parseFeed, rssParser, atomParser } from "@osmoscraft/feed-parser";
import { scanDir } from "./lib/scan-dir";

async function run() {
  const cwd = process.cwd();
  const projectDir = await scanDir(cwd);
  const project = await loadProject(projectDir.files);
  const feedUrls = project.config.content.channels.map((channel) => channel.url);

  console.log(feedUrls);

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

  console.log(jsonFeeds.length);
}

run();
