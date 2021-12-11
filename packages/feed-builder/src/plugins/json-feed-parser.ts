import { atomParser, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import { ParsedJsonFeed } from "@osmoscraft/osmosfeed-types";
import { id } from "./http-feed-downloader";
import { Plugin } from "../types/plugin";

export function useJsonFeedParser(): Plugin {
  return {
    id: "af5fb3c3-9dd8-4d99-a6a1-1f5d08ba3988",
    name: "JSON Feed Parser",
    onFeed: async ({ data, api }) => {
      const xml = api.getTempDataByPlugin<string>(id, "text");
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
