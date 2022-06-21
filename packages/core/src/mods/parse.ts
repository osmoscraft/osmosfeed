import type { PipeFeed } from "./pipe-feed";

export function useParse(): (feed: PipeFeed) => Promise<PipeFeed> {
  return async (feed) => {
    return feed;
  };
}
