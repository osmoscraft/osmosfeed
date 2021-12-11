import { atomParser, parseFeed, rssParser } from "@osmoscraft/feed-parser";
import { ParsedJsonFeed } from "@osmoscraft/osmosfeed-types";
import { FeedPlugin } from "../types/plugins";
import { httpFeedDownloaderPluginName } from "./http-feed-downloader";

export function useJsonFeedParser(): FeedPlugin {
  return async ({ sourceConfig, utils }) => {
    const xml = utils.getTempData(httpFeedDownloaderPluginName, "text");
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
