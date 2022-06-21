import { getSmartFetch } from "../../utils/fetch";
import { isValid, toError } from "../../utils/flow-control";
import type { PipeFeed } from "../pipe-feed";

export function useDownload(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    if (!isValid(feed.configResult)) return feed;

    try {
      const fetch = getSmartFetch();
      const response = await fetch(feed.configResult.url);
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
        download: toError(e),
      };
    }
  };
}
