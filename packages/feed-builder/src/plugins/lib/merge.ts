import type { JsonFeed } from "@osmosfeed/types";
import { deduplicate } from "./deduplicate";

export function mergeJsonFeed<T extends JsonFeed>(newFeed: T, existingFeed: T): T {
  return {
    ...existingFeed,
    ...newFeed,
    items: deduplicate([...existingFeed.items, ...newFeed.items], (a, b) => a.id === b.id), // implement with TDD
  };
}
