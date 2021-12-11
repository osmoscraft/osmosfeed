import { FeedPlugin } from "../types/plugins";
import { urlToFilename } from "./lib/url-to-filename";

/**
 * Update or create feed in storage by merging new feed content to the existing one
 */
export function useIncrementalFeedStorage(): FeedPlugin {
  return async ({ feed, sourceConfig, utils }) => {
    if (!feed.feed_url) throw new Error(); // TODO standardize error typing
    // read storage

    // merge incoming feed with content

    // write storage
    const filename = urlToFilename(feed.feed_url);

    return feed;
  };
}
