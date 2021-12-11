import type { JsonFeed, JsonFeedItem, ProjectConfig, SourceConfig } from "@osmoscraft/osmosfeed-types";

export type PartialJsonFeed = Partial<JsonFeed<PartialJsonFeedItem>>;
export type PartialJsonFeedItem = Partial<JsonFeedItem>;
export type PartialProjectConfig = Partial<ProjectConfig<PartialSourceConfig>>;
export type PartialSourceConfig = Partial<SourceConfig>;

// TODO rewrite mock plugins to simply exercise all paths of runtime (instead of testing individual mocks)
// TODO adjust typing for sources plugin (probably only need to keep feed_url)
export interface Plugin {
  /** Globally unique ID for associating plugin with its data */
  id: string;
  /** Name for display purposes */
  name: string;
  onConfig?: ConfigHook;
  onFeed?: FeedHook;
  onItem?: ItemHook;
}

export type ConfigHook = (input: ConfigHookInput) => Promise<PartialProjectConfig>;
export type FeedHook = (input: FeedHookInput) => Promise<PartialJsonFeed>;
export type ItemHook = (input: ItemHookInput) => Promise<JsonFeedItem>;

export interface ConfigHookInput {
  data: ConfigHookData;
}
export interface FeedHookInput {
  data: FeedHookData;
  api: FeedHookApi;
}
export interface ItemHookInput {
  data: ItemHookData;
  api: ItemHookApi;
}
export interface ConfigHookData {
  config: PartialProjectConfig;
}

export interface FeedHookData {
  pluginId: string;
  feed: PartialJsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}
export interface FeedHookApi {
  httpGet: (url: string) => Promise<HttpResponse>;
  getTextFile: (filename: string) => Promise<string | null>;
  setFile: (filename: string, content: Buffer | string) => Promise<void>;
}

export interface ItemHookData {
  pluginId: string;
  item: JsonFeedItem;
  feed: JsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}
export interface ItemHookApi {
  httpGet: (url: string) => Promise<HttpResponse>;
  getTextFile: (filename: string) => Promise<string | null>;
  setFile: (filename: string, content: Buffer | string) => Promise<void>;
}

export interface HttpResponse {
  statusCode: number;
  contentType?: string;
  buffer: Buffer;
}
