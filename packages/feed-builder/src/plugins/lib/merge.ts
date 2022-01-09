import type { JsonFeed, JsonFeedItem } from "@osmosfeed/types";
import { deduplicate } from "./deduplicate";

export function mergeJsonFeed<T extends JsonFeed>(newFeed: T, existingFeed: T): T {
  return {
    ...existingFeed,
    ...newFeed,
    items: deduplicate([...newFeed.items, ...existingFeed.items], (a, b) => a.id === b.id).sort(sortItems),
  };
}

function sortItems(a: JsonFeedItem, b: JsonFeedItem): number {
  const aPriority = a.date_published ? new Date(a.date_published).getTime() : +Infinity;
  const bPriority = b.date_published ? new Date(b.date_published).getTime() : +Infinity;
  return bPriority - aPriority;
}
