import type { JsonFeed, JsonFeedItem } from "./json-feed";
import type { JsonFeedParserExtension } from "./json-feed-ext-parser";

export type { JsonFeed, JsonFeedItem } from "./json-feed";

export type ParsedJsonFeed = JsonFeed<ParsedJsonFeedItem> & JsonFeedParserExtension;
export type ParsedJsonFeedItem = JsonFeedItem;

export type { ProjectConfig, SourceConfig, ProjectOutput } from "./project";
