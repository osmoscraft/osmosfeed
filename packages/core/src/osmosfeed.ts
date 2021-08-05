import { localJsonFeedCacheProvider } from "./lib/cache/local-cache-provider.js";
import { mergeJsonFeeds } from "./lib/merge/merge-json-feeds.js";
import { atomParser } from "./lib/parse/atom-parser.js";
import type { JsonFeed } from "./lib/parse/parse-xml-feed";
import { parseXmlFeed } from "./lib/parse/parse-xml-feed.js";
import { rssParser } from "./lib/parse/rss-parser.js";
import { httpGet } from "./utils/http-get.js";

export async function osmosfeed(feedUrls: string[]) {
  // TODO Extract to lib
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

  const cacheProvider = localJsonFeedCacheProvider("cache");

  const cachedJsonFeeds = await cacheProvider.read();
  const mergedJsonFeeds = mergeJsonFeeds(jsonFeeds, cachedJsonFeeds);

  await cacheProvider.write(mergedJsonFeeds);

  // TODO build site with cache
}
