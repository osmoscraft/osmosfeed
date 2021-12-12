import { atomParser, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import { ParsedJsonFeed } from "@osmoscraft/osmosfeed-types";
import { id } from "./feed-downloader";
import { Plugin } from "../types/plugin";

export function useJsonFeedParser(): Plugin {
  return {
    id: "af5fb3c3-9dd8-4d99-a6a1-1f5d08ba3988",
    name: "JSON Feed Parser",
    transformFeed: async ({ data, api }) => {
      // TODO handle error when rawFeed does not exist
      const xml = data.feed._plugin.rawFeed;
      const parsedFeed: ParsedJsonFeed = {
        ...parseFeed({
          xml,
          parsers: [rssParser, atomParser],
        }),
        feed_url: data.sourceConfig.url,
      };

      return parsedFeed;
    },
  };
}
