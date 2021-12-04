import type { JsonFeed, JsonFeedItem } from "./json-feed";
import type { JsonFeedParserExtension } from "./json-feed-ext-parser";
import type { JsonFeedCacheExtension, JsonFeedItemCacheExtension } from "./json-feed-ext-cache";

export type { JsonFeed, JsonFeedItem } from "./json-feed";

export type ParsedJsonFeed = JsonFeed & JsonFeedParserExtension;
export type ParsedJsonFeedItem = JsonFeedItem;

export type CachedJsonFeed = JsonFeed & JsonFeedParserExtension & JsonFeedCacheExtension;
export type CachedJsonFeedItem = JsonFeedItem & JsonFeedItemCacheExtension;
