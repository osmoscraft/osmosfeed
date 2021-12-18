import type { JsonFeed, JsonFeedItem, ProjectConfig, ProjectOutput, SourceConfig } from "@osmosfeed/types";

export type PartialJsonFeed = Partial<JsonFeed<PartialJsonFeedItem>>;
export type PartialJsonFeedItem = Partial<JsonFeedItem>;
export type PartialProjectConfig = Partial<ProjectConfig<PartialSourceConfig>>;
export type PartialSourceConfig = Partial<SourceConfig>;

export interface Plugin {
  /** npm package name. Must be globally unique for associating plugin with its data */
  // TODO store this in actual package.json. No need to duplicate information
  packageName: string;
  config?: ConfigHook;
  transformFeed?: TransformFeedHook;
  transformItem?: TransformItemHook;
  buildEnd?: BuildEndHook;
}

export type ConfigHook = (input: ConfigHookInput) => Promise<PartialProjectConfig>;
export type TransformFeedHook = (input: FeedHookInput) => Promise<PartialJsonFeed>;
export type TransformItemHook = (input: ItemHookInput) => Promise<JsonFeedItem>;
export type BuildEndHook = (input: BuildEndHookInput) => Promise<ProjectOutput>;

export interface ConfigHookInput {
  data: ConfigHookData;
  api: ConfigHookApi;
}
export interface FeedHookInput {
  data: FeedHookData;
  api: FeedHookApi;
}
export interface ItemHookInput {
  data: ItemHookData;
  api: ItemHookApi;
}
export interface BuildEndHookInput {
  data: BuildEndHookData;
  api: BuildEndHookApi;
}
export interface ConfigHookData {
  config: PartialProjectConfig;
}
export interface ConfigHookApi {
  log: ILogApi;
  storage: IStorageApi;
}

export interface FeedHookData {
  pluginId: string;
  feed: PartialJsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}
export interface FeedHookApi {
  log: ILogApi;
  network: INetworkApi;
  storage: IStorageApi;
}

export interface ItemHookData {
  pluginId: string;
  item: JsonFeedItem;
  feed: JsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}
export interface ItemHookApi {
  log: ILogApi;
  network: INetworkApi;
  storage: IStorageApi;
}

export interface BuildEndHookData {
  pluginId: string;
  feeds: JsonFeed[];
  projectConfig: ProjectConfig;
}

export interface BuildEndHookApi {
  storage: IStorageApi;
  log: ILogApi;
}

export interface ILogApi {
  error(...args: Parameters<typeof console["error"]>): void;
  info(...args: Parameters<typeof console["log"]>): void;
  trace(...args: Parameters<typeof console["log"]>): void;
}

export interface INetworkApi {
  get: (url: string) => Promise<HttpResponse>;
}

export interface IStorageApi {
  readPluginDataFile: (filename: string) => Promise<Buffer | null>;
  writePluginDataFile: (filename: string, content: Buffer | string) => Promise<void>;
  prunePluginDataFiles: (config: PruneFilesConfig) => Promise<void>;
  readFile: (pathToFile: string) => Promise<Buffer | null>;
  writeFile: (pathToFile: string, content: Buffer | string) => Promise<void>;
  readPluginStaticFile: (pathToFile: string) => Promise<Buffer | null>;
}

export interface PruneFilesConfig {
  keep: string[];
}

export interface HttpResponse {
  statusCode: number;
  contentType?: string;
  buffer: Buffer;
}
