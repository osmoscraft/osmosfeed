import { JsonFeed } from "@osmoscraft/osmosfeed-types";
import {
  OnConfigHookData,
  OnFeedHookApi,
  OnFeedHookData,
  OnItemHookApi,
  OnItemHookData,
  PartialJsonFeed,
  PartialProjectConfig,
  Plugin,
} from "../types/plugin";
import { FeedFormatError, ProjectConfigError } from "./lib/error-types";
import { getTextFile, setFile } from "./lib/file-storage";
import { httpGet } from "./lib/http-client";
import { reduceAsync } from "./lib/reduce-async";
import { getTempData, getTempDataByPlugin, setTempData } from "./lib/temp-data-storage";
import { isFeed, isProjectConfig, isValidFeed } from "./lib/type-guards";

export interface FeedBuilderInput {
  plugins?: Plugin[];
}

export interface FeedBuilderOutput {
  feeds?: JsonFeed[];
  errors?: any[];
}

export async function build(input: FeedBuilderInput): Promise<FeedBuilderOutput> {
  const { plugins = [] } = input;

  const configPlugins = plugins.filter((plugin) => plugin.onConfig);
  const feedPlugins = plugins.filter((plugin) => plugin.onFeed);
  const itemPlugins = plugins.filter((plugin) => plugin.onItem);

  const projectConfig = await reduceAsync(
    configPlugins,
    (config, plugin) => {
      const data: OnConfigHookData = {
        config,
      };
      return plugin.onConfig!({ data });
    },
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

            const api: OnFeedHookApi = {
              getTempData: getTempData.bind(null, {
                storeOnObject: feed,
                pluginId: plugin.id,
              }) as OnFeedHookApi["getTempData"],
              getTempDataByPlugin: getTempDataByPlugin.bind(null, {
                storeOnObject: feed,
                pluginId: plugin.id,
              }) as OnFeedHookApi["getTempDataByPlugin"],
              setTempData: setTempData.bind(null, { storeOnObject: feed, pluginId: plugin.id }),
              httpGet,
              getTextFile: getTextFile.bind(null, { pluginId: plugin.id }),
              setFile: setFile.bind(null, { pluginId: plugin.id }),
            };

            return plugin.onFeed!({ data, api });
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
              (item, plugin) => {
                const data: OnItemHookData = {
                  pluginId: plugin.id,
                  item,
                  feed: feedBase,
                  sourceConfig,
                  projectConfig,
                };
                const api: OnItemHookApi = {
                  httpGet,
                  getTextFile: getTextFile.bind(null, { pluginId: plugin.id }),
                  setFile: setFile.bind(null, { pluginId: plugin.id }),
                };

                return plugin.onItem!({ data, api });
              },
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

  // TODO support onFeedsDone for cache cleanup

  return {
    feeds: validFeeds,
    ...(feedsErrors.length ? { errors: feedsErrors } : {}),
  };
}
