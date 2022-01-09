import type { JsonFeed, JsonFeedItem } from "@osmosfeed/types";

export function mergeJsonFeed<T extends JsonFeed>(newFeed: T, existingFeed: T): T {
  return {
    ...existingFeed,
    ...newFeed,
    _ext: {
      ...existingFeed._ext,
      ...newFeed._ext,
      date_published: existingFeed._ext?.date_published ?? newFeed._ext?.date_published, // publish timestamp is considered immutable
    },
    items: mergeFeedItems(newFeed.items, existingFeed.items, mergeItems).sort(sortItems),
  };
}

export function mergeFeedItems<T extends JsonFeedItem>(
  incoming: T[],
  existing: T[],
  mergeItem: (incoming: T, existing?: T) => T
) {
  const resultMap = new Map(existing.reverse().map((item) => [item.id, item])); // oldest to newest
  incoming.reverse().forEach((incomingItem) => {
    const existingItem = resultMap.get(incomingItem.id);
    resultMap.set(incomingItem.id, mergeItem(incomingItem, existingItem));
  });

  return [...resultMap.values()].reverse();
}

function sortItems(a: JsonFeedItem, b: JsonFeedItem): number {
  const aPriority = a.date_published ? new Date(a.date_published).getTime() : +Infinity;
  const bPriority = b.date_published ? new Date(b.date_published).getTime() : +Infinity;
  return bPriority - aPriority;
}

function mergeItems(incoming: JsonFeedItem, existing?: JsonFeedItem): JsonFeedItem {
  return {
    ...existing,
    ...incoming,
    date_published: existing?.date_published ?? incoming?.date_published,
  };
}
