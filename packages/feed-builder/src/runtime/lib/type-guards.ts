import { JsonFeed, ProjectConfig, SourceConfig } from "@osmoscraft/osmosfeed-types";
import { PartialJsonFeed, PartialProjectConfig, PartialSourceConfig } from "../../types/plugin";

export function isValidFeed(maybeFeed: JsonFeed | null): maybeFeed is JsonFeed {
  return maybeFeed?._error === undefined;
}

export function isFeed(partialJsonFeed: PartialJsonFeed): partialJsonFeed is JsonFeed {
  return typeof partialJsonFeed.version === "string" && typeof partialJsonFeed.title === "string";
}

export function isProjectConfig(partialProjectConfig: PartialProjectConfig): partialProjectConfig is ProjectConfig {
  return partialProjectConfig?.sources?.every(isSourceConfig) === true;
}

export function isSourceConfig(partialSourceConfig: PartialSourceConfig): partialSourceConfig is SourceConfig {
  return typeof partialSourceConfig.url === "string";
}
