import { atomParser, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import { ParsedJsonFeed } from "@osmoscraft/osmosfeed-types";
import { FeedPlugin, getTempFeedData } from "../sdk";
import { httpFeedDownloadPluginName } from "./http-feed-download";

export function useJsonFeedParser(): FeedPlugin {
  return async ({ feed, sourceConfig }) => {
    const xml = getTempFeedData(feed, httpFeedDownloadPluginName, "text");
    const parsedFeed: ParsedJsonFeed = {
      ...parseFeed({
        xml,
        parsers: [rssParser, atomParser],
      }),
      feed_url: sourceConfig.url,
    };

    return parsedFeed;
  };
}
