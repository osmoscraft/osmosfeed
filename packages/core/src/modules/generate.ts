import { asError, extractError, undefinedAsError } from "../utils/error";
import type { PipeFeed } from "./types";

export function useGenerateWeb(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [mergedFeed, mergedFeedError] = extractError(undefinedAsError(feed.mergedFeed));
    if (mergedFeedError) return feed;

    try {
      return {
        ...feed,
        generate: true,
      };
    } catch (e) {
      return {
        ...feed,
        generate: asError(e)
      };
    }
  };
}
