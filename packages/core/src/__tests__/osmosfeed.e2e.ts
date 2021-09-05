import { localJsonFeedCacheProvider } from "../lib/cache/local-cache-provider";
import { mergeJsonFeeds } from "../lib/merge/merge-json-feeds";
import { atomParser } from "../lib/parse/atom-parser";
import type { JsonFeed } from "../lib/parse/parse-xml-feed";
import { parseXmlFeed } from "../lib/parse/parse-xml-feed";
import { rssParser } from "../lib/parse/rss-parser";
import { httpGet } from "../lib/http/http-get";
import { describe, beforeEach, it, expect } from "@osmosframe/test-utils";

import { readdir, rm, access, writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { render } from "../lib/render/render";

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
      "https://css-tricks.com/feed/",
      "https://www.smashingmagazine.com/feed",
      "http://export.arxiv.org/rss/cs",
    ];

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

    const css = await readFile("src/lib/render/style.css", "utf-8");
    const html = render(mergedJsonFeeds, css);
    await mkdir("src/__tests__/render-output", { recursive: true });
    await writeFile("src/__tests__/render-output/index.html", html);
  });
});
