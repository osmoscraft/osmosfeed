import { atomParser, parseFeed, rssParser } from "@osmosfeed/feed-parser";
import { ParsedJsonFeed } from "@osmosfeed/types";
import { Plugin } from "../types/plugin";

export function useJsonFeedParser(): Plugin {
  return {
    packageName: "@osmosfeed/json-feed-parser",
    transformFeed: async ({ data, api }) => {
      // TODO handle error when rawFeed does not exist
      const xml = data.feed._plugin.rawFeed;
      const parsedFeed: ParsedJsonFeed = {
        ...parseFeed({
          xml,
          parsers: [rssParser, atomParser],
        }),
      };

      return parsedFeed;
    },
  };
}
