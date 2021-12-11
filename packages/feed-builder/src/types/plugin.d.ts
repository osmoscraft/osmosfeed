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
  onConfig?: OnConfig;
  onFeed?: OnFeed;
  onItem?: OnItem;
}

export type OnConfig = (input: { data: OnConfigHookData }) => Promise<PartialProjectConfig>;
export type OnFeed = (input: { data: OnFeedHookData; api: OnFeedHookApi }) => Promise<PartialJsonFeed>;
export type OnItem = (input: { data: OnItemHookData; api: OnItemHookApi }) => Promise<JsonFeedItem>;

export interface OnConfigHookData {
  config: PartialProjectConfig;
}

export interface OnFeedHookData {
  pluginId: string;
  feed: PartialJsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}
export interface OnFeedHookApi {
  httpGet: (req: HttpRequest) => Promise<HttpResponse>;
  getTempData: <T = any>(key: string) => T;
  getTempDataByPlugin: <T = any>(pluginId: string, key: string) => T;
  setTempData: (key: string, value: any) => void;
  getTextFile: (filename: string) => Promise<string | null>;
  setFile: (filename: string, content: Buffer | string) => Promise<void>;
}

export interface OnItemHookData {
  pluginId: string;
  item: JsonFeedItem;
  feed: JsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}
export interface OnItemHookApi {
  httpGet: (req: HttpRequest) => Promise<HttpResponse>;
  getTextFile: (filename: string) => Promise<string | null>;
  setFile: (filename: string, content: Buffer | string) => Promise<void>;
}

export interface HttpRequest {
  url: string;
}
export interface HttpResponse {
  statusCode: number;
  contentType?: string;
  buffer: Buffer;
}
