import { ParsedJsonFeed } from "@osmosfeed/types";
import { Plugin } from "../types";

/**
 * When publish time is missing, use mofidied time
 * When channel timestamp is missing, use latest item time, then use current time
 * When item timestamp is missing, use channel timestamp
 *
 * This plugin assumes channel level timestamp is stored in
 * <channelObject>._ext.date_published
 * <channelObject>._ext.date_modified
 *
 * This plugin also assumes before build ends, the items in each feed to sorted from latest to oldest
 */
export function useSyntheticPublishTime(): Plugin {
  return {
    packageName: "@osmosfeed/synthetic-publish-time",
    transformItem: async ({ data }) => {
      return {
        ...data.item,
        date_published:
          data.item.date_published ??
          data.item.date_modified ??
          (data.feed as ParsedJsonFeed)._ext?.date_published ??
          (data.feed as ParsedJsonFeed)._ext?.date_modified ??
          new Date().toISOString(),
      };
    },
    buildEnd: async ({ data }) => {
      return {
        feeds: data.feeds.map((feed) => ({
          ...feed,
          _ext: {
            ...feed._ext,
            date_published:
              (feed as ParsedJsonFeed)._ext?.date_published ??
              (feed as ParsedJsonFeed)._ext?.date_modified ??
              feed.items[0]?.date_published ??
              feed.items[0]?.date_modified ??
              new Date().toISOString(),
          },
        })),
      };
    },
  };
}
