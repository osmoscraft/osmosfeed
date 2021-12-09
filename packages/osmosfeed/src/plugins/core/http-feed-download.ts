import { httpRequest } from "../../lib/http-request";
import { FeedPlugin, setTempFeedData } from "../sdk";

export const httpFeedDownloadPluginName = "httpFeedDownload";

export function useHttpFeedDownload(): FeedPlugin {
  return async ({ feed, sourceConfig }) => {
    const result = await httpRequest(sourceConfig.url);

    // TODO error handling
    setTempFeedData(feed, httpFeedDownloadPluginName, ["text", result.buffer.toString("utf8")]);
    return feed;
  };
}
