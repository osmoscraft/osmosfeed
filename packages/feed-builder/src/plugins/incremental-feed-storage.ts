import { Plugin } from "../types/plugin";
import { mergeJsonFeed } from "./lib/merge";
import { sha256 } from "./lib/sha256";

/**
 * Update or create feed in storage by merging new feed content to the existing one
 */
export function useIncrementalFeedStorage(): Plugin {
  const filesToKeep: string[] = [];

  return {
    id: "04722f59-f9c9-431f-a9fd-c664a328577c",
    name: "Incremental Feed Storage",
    transformFeed: async ({ data, api }) => {
      const { feed } = data;

      if (!feed.feed_url) throw new Error(); // TODO standardize error typing

      let mergedFeed = feed;
      const filename = `${sha256(feed.feed_url)}.json`;
      // read storage
      const storedFeedRaw = await api.getTextFile(filename);

      // merge incoming feed with content
      if (storedFeedRaw) {
        mergedFeed = mergeJsonFeed(feed, JSON.parse(storedFeedRaw));
      }

      // write storage
      await api.setFile(filename, JSON.stringify(mergedFeed, null, 2));
      filesToKeep.push(filename);

      return mergedFeed;
    },
    buildEnd: async ({ data, api }) => {
      await api.pruneFiles({
        keep: filesToKeep,
      });

      return data;
    },
  };
}
