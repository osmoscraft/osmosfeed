import type { JsonFeed, JsonFeedItem, ProjectConfig, SourceConfig } from "@osmoscraft/osmosfeed-types";

export type PartialJsonFeed = Partial<JsonFeed<PartialJsonFeedItem>>;
export type PartialJsonFeedItem = Partial<JsonFeedItem>;
export type PartialProjectConfig = Partial<ProjectConfig<PartialSourceConfig>>;
export type PartialSourceConfig = Partial<SourceConfig>;

// TODO rewrite mock plugins to simply exercise all paths of runtime (instead of testing individual mocks)
// TODO adjust typing for sources plugin (probably only need to keep feed_url)
export interface Plugin {
  id: string;
  displayName?: string;
  onConfig?: OnConfig;
  onFeed?: OnFeed;
  onItem?: OnItem;
}

export type OnConfig = (input: { config: PartialProjectConfig }) => Promise<PartialProjectConfig>;
export interface OnFeedHookData {
  pluginId: string;
  feed: PartialJsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}
export type OnFeed = (input: { data: OnFeedHookData; api: FeedPluginApi }) => Promise<PartialJsonFeed>;
export type OnItem = (input: {
  item: JsonFeedItem;
  feed: JsonFeed;
  sourceConfig: SourceConfig;
  projectConfig: ProjectConfig;
}) => Promise<JsonFeedItem>;

export interface FeedPluginApi {
  httpGet: (req: HttpRequest) => Promise<HttpResponse>;
  getTempData: <T = any>(key: string) => T;
  getTempDataByPlugin: <T = any>(pluginId: string, key: string) => T;
  setTempData: (key: string, value: any) => void;
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
