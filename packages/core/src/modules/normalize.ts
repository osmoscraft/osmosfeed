import { asError, extractError, undefinedAsError } from "../utils/error";
import type { PipeFeed } from "./types";

export function useNormalize(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [jsonFeed, jsonFeedError] = extractError(undefinedAsError(feed.jsonFeed));
    if (jsonFeedError) return feed;

    const [config, configError] = extractError(undefinedAsError(feed.config));
    if (configError) return feed;

    try {
      return {
        ...feed,
        normalizedFeed: {
          ...jsonFeed,
          feed_url: config.url,
          items: jsonFeed.items.map((item) => ({
            ...item,
            date_published: item?.date_published ?? new Date().toISOString(),
          })),
        },
      };
    } catch (e) {
      return {
        ...feed,
        normalizedFeed: asError(e),
      };
    }
  };
}
