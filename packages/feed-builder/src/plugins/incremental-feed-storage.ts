import { Plugin } from "../types/plugin";
import { mergeJsonFeed } from "./lib/merge";
import { sha256 } from "./lib/sha256";

/**
 * Update or create feed in storage by merging new feed content to the existing one
 */
export function useIncrementalFeedStorage(): Plugin {
  const filesToKeep: string[] = [];

  return {
    packageName: "@osmosfeed/incremental-feed-storage",
    transformFeed: async ({ data, api }) => {
      const { feed } = data;

      if (!feed.feed_url) throw new Error(); // TODO standardize error typing

      let mergedFeed = feed;
      const filename = `${sha256(feed.feed_url)}.json`;
      // read storage
      const storedFeedRaw = await api.storage.getTextFile(filename);

      // merge incoming feed with content
      if (storedFeedRaw) {
        mergedFeed = mergeJsonFeed(feed, JSON.parse(storedFeedRaw));
      }

      return mergedFeed;
    },
    buildEnd: async ({ data, api }) => {
      // write storage
      await Promise.all(
        data.feeds.map(async (feed) => {
          if (!feed.feed_url) throw new Error(); // TODO standardize error typing
          api.log.trace(`Store ${feed.feed_url}`);
          const filename = `${sha256(feed.feed_url!)}.json`;
          await api.storage.setFile(filename, JSON.stringify(feed, null, 2));
          filesToKeep.push(filename);
        })
      );

      // TODO log number of files pruned
      await api.storage.pruneFiles({
        keep: filesToKeep,
      });

      return data;
    },
  };
}
