import { ParsedJsonFeed } from "@osmosfeed/types";
import { Plugin } from "../types";

/**
 * Assuming all feed has _ext.data_published filled
 */
export function useOrderFeedsByPublishTime(): Plugin {
  return {
    packageName: "@osmosfeed/order-feeds-by-publish-time",
    buildEnd: async ({ data }) => {
      const sortedFeeds = data.feeds.sort(
        (a, b) => new Date(b._ext.date_published).getTime() - new Date(a._ext.date_published).getTime()
      );

      return {
        feeds: sortedFeeds,
      };
    },
  };
}
