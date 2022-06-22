import { asError, extractError, undefinedAsError } from "../../utils/error";
import type { PipeFeed } from "../types";

export const useCache = {
  reader: useCacheReader,
  writer: useCacheWriter,
};

function useCacheReader(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [config, configError] = extractError(undefinedAsError(feed.config));
    if (configError) return feed;

    // TODO read cache from disk

    try {
      return {
        ...feed,
        cacheRead: null,
      };
    } catch (e) {
      return {
        ...feed,
        cacheRead: asError(e),
      };
    }
  };
}

function useCacheWriter(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    // TODO write cache to disk

    try {
      return {
        ...feed,
        cacheWriteSummary: null,
      };
    } catch (e) {
      return {
        ...feed,
        cacheWriteSummary: asError(e),
      };
    }
  };
}
