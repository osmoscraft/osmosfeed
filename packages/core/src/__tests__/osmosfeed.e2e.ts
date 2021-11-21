import { beforeEach, describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { access, mkdir, copyFile, readdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import type { JsonFeedChannel } from "../lib";
import {
  atomParser,
  localJsonFeedCacheProvider,
  mergeJsonFeeds,
  parseFeed,
  renderSite,
  request,
  rssParser,
} from "../lib";

const cacheOutputDir = path.join(process.cwd(), "src/__tests__/cache-output");

describe("E2E", () => {
  beforeEach(async () => {
    try {
      await access(cacheOutputDir);
      await rm(cacheOutputDir, { recursive: true });
    } catch (error) {}
  });

  it("Generates feed reader from urls", async () => {
    // act
    const feedUrls = [
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCHugE6eRhqB9_AZQh4DDbIw", // Atom, YouTube
      "https://css-tricks.com/feed/", // RSS 2.0
      "https://www.smashingmagazine.com/feed", // RSS 2.0, enclosure
      "http://export.arxiv.org/rss/cs", // RSS 1.0 (rdf)
    ];

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

    const cacheProvider = localJsonFeedCacheProvider("src/e2e/__fixtures__/mock-cache", "src/__tests__/cache-output");

    const cachedJsonFeeds = await cacheProvider.read();
    const mergedJsonFeeds = mergeJsonFeeds(jsonFeeds, cachedJsonFeeds);

    await cacheProvider.write(mergedJsonFeeds);

    // assertion

    const cacheOutputFiles = await readdir(cacheOutputDir);
    const jsonFiles = cacheOutputFiles.filter((filename) => filename.includes(".json"));
    await expect(jsonFiles.length > 0).toEqual(true);

    const html = renderSite({
      data: mergedJsonFeeds,
      assets: [
        { type: "script", href: "assets/app.js" },
        { type: "stylesheet", href: "assets/styles.css" },
      ],
    });
    await mkdir("src/__tests__/render-output/assets", { recursive: true });
    await writeFile("src/__tests__/render-output/index.html", html);
    await copyFile("src/lib/render/assets/styles.css", "src/__tests__/render-output/assets/styles.css");
    await copyFile("src/lib/render/assets/app.js", "src/__tests__/render-output/assets/slide-control.js");
  });
});
