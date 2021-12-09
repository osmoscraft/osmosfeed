import { FeedPlugin, httpRequest, setTempFeedData } from "../sdk";

export const httpFeedDownloaderPluginName = "httpFeedDownloader";

export function useHttpFeedDownloader(): FeedPlugin {
  return async ({ feed, sourceConfig }) => {
    const result = await httpRequest(sourceConfig.url);

    // TODO error handling
    setTempFeedData(feed, httpFeedDownloaderPluginName, ["text", result.buffer.toString("utf8")]);
    return feed;
  };
}
