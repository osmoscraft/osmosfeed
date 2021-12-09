import type { JsonFeed, JsonFeedItem, ProjectConfig, SourceConfig } from "@osmoscraft/osmosfeed-types";

export function setTempFeedData(feed: PartialJsonFeed, pluginName: string, keyValueTuple: [key: string, value: any]) {
  feed._temp ??= {};
  feed._temp[pluginName] ??= {};
  feed._temp[pluginName][keyValueTuple[0]] = keyValueTuple[1];
}

export function getTempFeedData<T = any>(feed: PartialJsonFeed, pluginName: string, key: string): T {
  return feed?._temp?.[pluginName]?.[key];
}

export function clearTempFeedData(feed: PartialJsonFeed) {
  delete feed._temp;
}

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

export type ConfigPlugin = (input: { config?: PartialProjectConfig }) => Promise<PartialProjectConfig>;
export type FeedPlugin = (input: {
  feed: PartialJsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}) => Promise<PartialJsonFeed>;
export type ItemPlugin = (input: {
  item: JsonFeedItem;
  feed: JsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}) => Promise<JsonFeedItem>;
