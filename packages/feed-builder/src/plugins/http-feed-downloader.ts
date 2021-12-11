import { FeedPlugin } from "../types/plugins";

export const httpFeedDownloaderPluginName = "httpFeedDownloader";

export function useHttpFeedDownloader(): FeedPlugin {
  return async ({ feed, sourceConfig, utils }) => {
    const result = await utils.httpGet({ url: sourceConfig.url });

    // TODO error handling
    utils.setTempData(httpFeedDownloaderPluginName, "text", result.buffer.toString("utf8"));
    return feed;
  };
}
