import { asError, extractError, undefinedAsError } from "../../utils/error";
import { escapeUnicodeUrl } from "../../utils/url";
import type { PipeFeed } from "../types";

export function useConfig(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    const [config, configError] = extractError(undefinedAsError(feed.config));
    if (configError) return feed;

    try {
      return {
        ...feed,
        config: {
          ...feed.config,
          url: escapeUnicodeUrl(config.url),
        },
      };
    } catch (e) {
      return {
        ...feed,
        config: asError(e),
      };
    }
  };
}
