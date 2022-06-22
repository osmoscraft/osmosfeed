import { asError, extractError, undefinedAsError } from "../utils/error";
import { parse } from "./parse/json-feed-parser";
import type { PipeFeed } from "./types";

export function useParse(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [download, downloadError] = extractError(undefinedAsError(feed.download));
    if (downloadError) return feed;

    try {
      const jsonFeed = await parse(download.content);
      return {
        ...feed,
        jsonFeed: jsonFeed,
      };
    } catch (e) {
      return {
        ...feed,
        jsonFeed: asError(e),
      };
    }
  };
}
