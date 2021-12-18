import type { JsonFeed } from "@osmosfeed/types";

export function mergeJsonFeeds(newFeeds: JsonFeed[], existingFeeds: JsonFeed[]): JsonFeed[] {
  return [...existingFeeds, ...newFeeds]; // TODO implement actual merge with TDD
}

function mergeJsonFeed(newFeed: JsonFeed, existingFeed: JsonFeed): JsonFeed {
  return {
    ...existingFeed,
    ...newFeed,
    items: {
      ...existingFeed.items,
      ...newFeed.items,
    }, // implement with TDD
  };
}
