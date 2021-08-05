import { localJsonFeedCacheProvider } from "../lib/cache/local-cache-provider.js";
import { mergeJsonFeeds } from "../lib/merge/merge-json-feeds.js";
import { atomParser } from "../lib/parse/atom-parser.js";
import type { JsonFeed } from "../lib/parse/parse-xml-feed";
import { parseXmlFeed } from "../lib/parse/parse-xml-feed.js";
import { rssParser } from "../lib/parse/rss-parser.js";
import { expect } from "../test-helper/assertion.js";
import { describe } from "../test-helper/scheduler.js";
import { httpGet } from "../utils/http-get.js";

import { readdir, rmdir, access } from "fs/promises";
import path from "path";

describe("E2E", ({ spec }) => {
  spec("Parse CSS Tricks RSS", async () => {
    // arrange
    const cacheOutputDir = path.join(process.cwd(), "src/e2e/__fixtures__/cache-output");

    try {
      await access(cacheOutputDir);
      await rmdir(cacheOutputDir, { recursive: true });
    } catch (error) {}

    // act
    const feedUrls = ["https://css-tricks.com/feed/"];

    const rawFeeds = await Promise.all(
      feedUrls.map(async (feedUrl) => {
        const { raw } = await httpGet(feedUrl);
        return {
          feedUrl,
          textResponse: raw, // TODO error status handling
        };
      })
    );

    const jsonFeeds: JsonFeed[] = rawFeeds.map((rawFeed) => ({
      ...parseXmlFeed({
        rawString: rawFeed.textResponse,
        xmlParsers: [rssParser, atomParser],
      }),
      feed_url: rawFeed.feedUrl,
    }));

    const cacheProvider = localJsonFeedCacheProvider("src/e2e/__fixtures__/cache", "src/e2e/__fixtures__/cache-output");

    const cachedJsonFeeds = await cacheProvider.read();
    const mergedJsonFeeds = mergeJsonFeeds(jsonFeeds, cachedJsonFeeds);

    await cacheProvider.write(mergedJsonFeeds);

    // assertion

    const cacheOutputFiles = await readdir(cacheOutputDir);
    const jsonFiles = cacheOutputFiles.filter((filename) => filename.includes(".json"));
    await expect(jsonFiles.length > 0).toEqual(true);
  });
});
