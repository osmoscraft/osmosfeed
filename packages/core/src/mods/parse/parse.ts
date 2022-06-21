import { isValid, toError } from "../../utils/flow-control";
import type { PipeFeed } from "../pipe-feed";
import { parse } from "./json-feed-parser/json-feed-parser";

export function useParse(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    if (!isValid(feed.download)) return feed;

    try {
      const jsonFeed = await parse(feed.download.content);
      return {
        ...feed,
        parseResult: jsonFeed,
      };
    } catch (e) {
      return {
        ...feed,
        parseResult: toError(e),
      };
    }
  };
}
