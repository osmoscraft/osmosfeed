import type { JsonFeedChannel } from "../json-feed";

export function mergeJsonFeeds(newFeeds: JsonFeedChannel[], existingFeeds: JsonFeedChannel[]): JsonFeedChannel[] {
  return [...existingFeeds, ...newFeeds]; // TODO implement actual merge with TDD
}

function mergeJsonFeed(newFeed: JsonFeedChannel, existingFeed: JsonFeedChannel): JsonFeedChannel {
  return {
    ...existingFeed,
    ...newFeed,
    items: {
      ...existingFeed.items,
      ...newFeed.items,
    }, // implement with TDD
  };
}
