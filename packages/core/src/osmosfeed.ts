import { localJsonFeedCacheProvider } from "./lib/local-cache-provider.js";
import { mergeJsonFeeds } from "./lib/merge-json-feeds.js";
import { httpGet } from "./utils/http-get.js";
import { JsonFeed, parseFeed } from "./utils/parse-feed.js";

export async function osmosfeed(feedUrls: string[]) {
  // TODO Extract to lib
  const rawFeeds = await Promise.all(
    feedUrls.map(async (feedUrl) => ({
      feedUrl,
      textResponse: (await httpGet(feedUrl)).raw, // TODO error status handling
    }))
  );

  const jsonFeeds: JsonFeed[] = rawFeeds.map((rawFeed) => ({
    ...parseFeed(rawFeed.textResponse), // TODO Expose parameters for customization
    feed_url: rawFeed.feedUrl,
  }));

  const cacheProvider = localJsonFeedCacheProvider("cache");

  const cachedJsonFeeds = await cacheProvider.read();
  const mergedJsonFeeds = mergeJsonFeeds(jsonFeeds, cachedJsonFeeds);

  await cacheProvider.write(mergedJsonFeeds);

  // TODO build site with cache
}
