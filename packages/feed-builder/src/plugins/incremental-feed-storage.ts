import { Plugin } from "../types/plugins";
import { sha256 } from "./lib/sha256";

/**
 * Update or create feed in storage by merging new feed content to the existing one
 */
export function useIncrementalFeedStorage(): Plugin {
  return {
    id: "04722f59-f9c9-431f-a9fd-c664a328577c",
    onFeed: async ({ data, api }) => {
      const { feed } = data;

      if (!feed.feed_url) throw new Error(); // TODO standardize error typing
      // read storage

      // merge incoming feed with content

      // write storage
      const filename = sha256(feed.feed_url);
      await api.setFile(filename, "hello world");

      return feed;
    },
  };
}
