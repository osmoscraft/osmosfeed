import { asError, extractError, undefinedAsError } from "../../utils/error";
import { getSmartFetch } from "../../utils/fetch";
import type { PipeFeed } from "../types";

export function useDownload(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [config, configError] = extractError(undefinedAsError(feed.config));
    if (configError) return feed;

    try {
      const fetch = getSmartFetch();
      const response = await fetch(config.url);
      return {
        ...feed,
        download: response.ok
          ? {
              content: await response.text(),
              mediaType: await response.headers.get("Content-Type"),
            }
          : new Error(`Failed to fetch ${response.status}`),
      };
    } catch (e) {
      return {
        ...feed,
        download: asError(e),
      };
    }
  };
}
