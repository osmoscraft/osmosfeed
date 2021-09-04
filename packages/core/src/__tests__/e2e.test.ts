import { localJsonFeedCacheProvider } from "../lib/cache/local-cache-provider";
import { mergeJsonFeeds } from "../lib/merge/merge-json-feeds";
import { atomParser } from "../lib/parse/atom-parser";
import type { JsonFeed } from "../lib/parse/parse-xml-feed";
import { parseXmlFeed } from "../lib/parse/parse-xml-feed";
import { rssParser } from "../lib/parse/rss-parser";
import { expect } from "../test-helper/assertion";
import { describe } from "../test-helper/scheduler";
import { httpGet } from "../lib/http/http-get";

import { readdir, rm, access } from "fs/promises";
import path from "path";

const cacheOutputDir = path.join(process.cwd(), "src/__tests__/cache-output");

describe("E2E", ({ beforeEach, spec }) => {
  beforeEach(async () => {
    try {
      await access(cacheOutputDir);
      await rm(cacheOutputDir, { recursive: true });
    } catch (error) {}
  });

  spec("Parse CSS Tricks RSS", async () => {
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

    const cacheProvider = localJsonFeedCacheProvider("src/e2e/__fixtures__/mock-cache", "src/__tests__/cache-output");

    const cachedJsonFeeds = await cacheProvider.read();
    const mergedJsonFeeds = mergeJsonFeeds(jsonFeeds, cachedJsonFeeds);

    await cacheProvider.write(mergedJsonFeeds);

    // assertion

    const cacheOutputFiles = await readdir(cacheOutputDir);
    const jsonFiles = cacheOutputFiles.filter((filename) => filename.includes(".json"));
    await expect(jsonFiles.length > 0).toEqual(true);
  });
});
