import { JsonFeed } from "@osmosfeed/types";
import { Plugin } from "../types";

/**
 * Output the minimum required data for a valid JSON feed, solely based on config
 */
export function useFeedSkeleton(): Plugin {
  return {
    packageName: "@osmosfeed/feed-skeleton",
    transformFeed: async ({ data, api }) => {
      const skeleton: JsonFeed = {
        ...data.feed,
        version: "https://jsonfeed.org/version/1.1",
        title: data.sourceConfig.url,
        feed_url: data.sourceConfig.url,
        items: [],
      };

      return skeleton;
    },
  };
}
