import type { JsonFeed, JsonFeedItem, ProjectConfig, SourceConfig } from "@osmoscraft/osmosfeed-types";

export type PartialJsonFeed = Partial<JsonFeed<PartialJsonFeedItem>>;
export type PartialJsonFeedItem = Partial<JsonFeedItem>;
export type PartialProjectConfig = Partial<ProjectConfig<PartialSourceConfig>>;
export type PartialSourceConfig = Partial<SourceConfig>;

export interface Plugins {
  configPlugins?: ConfigPlugin[];
  feedPlugins?: FeedPlugin[];
  itemPlugins?: ItemPlugin[];
}

// TODO rewrite mock plugins to simply exercise all paths of runtime (instead of testing individual mocks)
// TODO adjust typing for sources plugin (probably only need to keep feed_url)
export interface PluginDefinition {
  name: string;
  // onConfig?: () =>
  // onFeed?: () =>
  // onItem?: () =>
}

export type ConfigPlugin = (input: { config: PartialProjectConfig }) => Promise<PartialProjectConfig>;
export type FeedPlugin = (input: {
  feed: PartialJsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
  utils: FeedPluginUtils;
}) => Promise<PartialJsonFeed>;
export type ItemPlugin = (input: {
  item: JsonFeedItem;
  feed: JsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}) => Promise<JsonFeedItem>;

export interface FeedPluginUtils {
  httpGet: (req: HttpRequest) => Promise<HttpResponse>;
  getTempData: <T = any>(pluginName: string, key: string) => T;
  setTempData: (pluginName: string, key: string, value: any) => void;
  getTextFile: (pluginName: string, filename: string) => Promise<string>;
  setFile: (pluginName: string, filename: string, fileContent: Buffer | string) => Promise<void>;
}

export interface HttpRequest {
  url: string;
}
export interface HttpResponse {
  statusCode: number;
  contentType?: string;
  buffer: Buffer;
}
