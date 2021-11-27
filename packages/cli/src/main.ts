import { atomParser, JsonFeedChannel, parseFeed, renderSite, request, rssParser } from "@osmoscraft/osmosfeed-core";
import { copyFile, mkdir, writeFile } from "fs/promises";

async function run() {
  const feedUrls = [
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCHugE6eRhqB9_AZQh4DDbIw", // Atom, YouTube
    "https://css-tricks.com/feed/", // RSS 2.0
    "https://www.smashingmagazine.com/feed", // RSS 2.0, enclosure
    "http://export.arxiv.org/rss/cs", // RSS 1.0 (rdf)
  ];

  const rawFeeds = await Promise.all(
    feedUrls.map(async (feedUrl) => {
      const { raw } = await request(feedUrl);
      console.log(`Fetched: ${feedUrl}`);
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

  const html = renderSite({
    data: jsonFeeds,
    assets: [
      { type: "script", href: "assets/index.js" },
      { type: "stylesheet", href: "assets/index.css" },
    ],
  });
  await mkdir("test-output/assets", { recursive: true });
  await writeFile("test-output/index.html", html);
  await copyFile("dist/client/index.css", "test-output/assets/index.css");
  await copyFile("dist/client/index.js", "test-output/assets/index.js");
}

run();
