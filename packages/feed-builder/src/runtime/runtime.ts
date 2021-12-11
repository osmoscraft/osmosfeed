import { JsonFeed } from "@osmoscraft/osmosfeed-types";
import { ProjectConfig, SourceConfig } from "@osmoscraft/osmosfeed-types/project-config";
import {
  FeedPluginApi,
  OnFeedHookData,
  PartialJsonFeed,
  PartialProjectConfig,
  PartialSourceConfig,
  Plugin,
} from "../types/plugins";
import { getTextFile, setFile } from "./lib/file-storage";
import { httpGet } from "./lib/http-client";
import { getTempData, getTempDataByPlugin, setTempData } from "./lib/temp-data-storage";

export interface FeedBuilderInput {
  plugins?: Plugin[];
}

export interface FeedBuilderOutput {
  feeds?: JsonFeed[];
  errors?: any[];
}
export interface FeedBuilderError {}

export async function build(input: FeedBuilderInput): Promise<FeedBuilderOutput> {
  const { plugins = [] } = input;

  const configPlugins = plugins.filter((plugin) => plugin.onConfig);
  const feedPlugins = plugins.filter((plugin) => plugin.onFeed);
  const itemPlugins = plugins.filter((plugin) => plugin.onItem);

  const projectConfig = await reduceAsync(
    configPlugins,
    (config, plugin) => plugin.onConfig!({ config }),
    {} as PartialProjectConfig
  );

  if (!isProjectConfig(projectConfig)) {
    return {
      errors: [new ProjectConfigError()],
    };
  }

  const feedsErrors: any[] = [];
  const feeds = await Promise.all(
    (projectConfig.sources ?? []).map(async (sourceConfig) => {
      try {
        const feedBase = await reduceAsync(
          feedPlugins,
          (feed, plugin) => {
            const data: OnFeedHookData = {
              pluginId: plugin.id,
              feed,
              sourceConfig,
              projectConfig,
            };
            const utils: FeedPluginApi = {
              getTempData: getTempData.bind(null, data) as FeedPluginApi["getTempData"],
              getTempDataByPlugin: getTempDataByPlugin.bind(null, data) as FeedPluginApi["getTempDataByPlugin"],
              setTempData: setTempData.bind(null, data),
              httpGet,
              getTextFile: getTextFile.bind(null, data),
              setFile: setFile.bind(null, data),
            };
            return plugin.onFeed!({ data: data, api: utils });
          },
          {} as PartialJsonFeed
        );

        // TODO add feed url to the error details
        if (!isFeed(feedBase)) throw new FeedFormatError();

        const itemsBase = feedBase.items ?? [];
        const itemsEnriched = await Promise.all(
          itemsBase.map(async (itemDry) => {
            const itemEnriched = await reduceAsync(
              itemPlugins,
              (item, plugin) => plugin.onItem!({ item, feed: feedBase, sourceConfig, projectConfig }),
              itemDry
            );

            return itemEnriched;
          })
        );

        return { ...feedBase, items: itemsEnriched };
      } catch (error) {
        feedsErrors.push(error);
        return null;
      }
    })
  );

  const validFeeds = feeds.filter(isValidFeed);

  return {
    feeds: validFeeds,
    ...(feedsErrors.length ? { errors: feedsErrors } : {}),
  };
}

function isValidFeed(maybeFeed: JsonFeed | null): maybeFeed is JsonFeed {
  return maybeFeed?._error === undefined;
}

function isFeed(partialJsonFeed: PartialJsonFeed): partialJsonFeed is JsonFeed {
  return typeof partialJsonFeed.version === "string" && typeof partialJsonFeed.title === "string";
}

function isProjectConfig(partialProjectConfig: PartialProjectConfig): partialProjectConfig is ProjectConfig {
  return partialProjectConfig?.sources?.every(isSourceConfig) === true;
}

function isSourceConfig(partialSourceConfig: PartialSourceConfig): partialSourceConfig is SourceConfig {
  return typeof partialSourceConfig.url === "string";
}

async function reduceAsync<T, P>(values: T[], reducer: (prev: P, current: T) => Promise<P>, initial: P) {
  let result: P = initial;
  for (let value of values) {
    result = await reducer(result, value);
  }
  return result;
}

export class ProjectConfigError extends Error {}
export class FeedFormatError extends Error {}
