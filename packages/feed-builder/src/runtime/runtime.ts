import { JsonFeed, ProjectOutput } from "@osmosfeed/types";
import {
  BuildEndHookApi,
  BuildEndHookData,
  ConfigHookApi,
  ConfigHookData,
  FeedHookApi,
  FeedHookData,
  ItemHookApi,
  ItemHookData,
  PartialJsonFeed,
  PartialProjectConfig,
  Plugin,
} from "../types/plugin";
import { LogApi } from "./api/log";
import { NetworkApi } from "./api/network";
import { StorageApi } from "./api/storage";
import { FeedFormatError, ProjectConfigError } from "./lib/error-types";
import { reduceAsync } from "./lib/reduce-async";
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

  const configPlugins = plugins.filter((plugin) => plugin.config);
  const transformFeedPlugins = plugins.filter((plugin) => plugin.transformFeed);
  const transformItemPlugins = plugins.filter((plugin) => plugin.transformItem);
  const buildEndPlugins = plugins.filter((plugin) => plugin.buildEnd);

  const runtimeLogger = new LogApi();

  const projectConfig = await reduceAsync(
    configPlugins,
    (config, plugin) => {
      const data: ConfigHookData = {
        config,
      };

      const api: ConfigHookApi = {
        log: new LogApi(),
        storage: new StorageApi({ pluginPackageName: plugin.packageName }),
      };
      return plugin.config!({ data, api });
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
          transformFeedPlugins,
          async (feed, plugin) => {
            const data: FeedHookData = {
              pluginId: plugin.packageName,
              feed,
              sourceConfig,
              projectConfig,
            };

            const api: FeedHookApi = {
              storage: new StorageApi({ pluginPackageName: plugin.packageName }),
              network: new NetworkApi(),
              log: new LogApi(),
            };

            try {
              return await plugin.transformFeed!({ data, api });
            } catch (error) {
              runtimeLogger.error(`${plugin.packageName} had error transforming feed url ${sourceConfig.url}`);
              throw error;
            }
          },
          {} as PartialJsonFeed
        );

        // TODO add feed url to the error details
        if (!isFeed(feedBase)) throw new FeedFormatError();

        // TODO skip item without URL?

        const itemsBase = feedBase.items ?? [];
        const itemsEnriched = await Promise.all(
          itemsBase.map(async (itemDry) => {
            const itemEnriched = await reduceAsync(
              transformItemPlugins,
              async (item, plugin) => {
                const data: ItemHookData = {
                  pluginId: plugin.packageName,
                  item,
                  feed: feedBase,
                  sourceConfig,
                  projectConfig,
                };

                const api: ItemHookApi = {
                  storage: new StorageApi({ pluginPackageName: plugin.packageName }),
                  network: new NetworkApi(),
                  log: new LogApi(),
                };

                try {
                  return await plugin.transformItem!({ data, api });
                } catch (error) {
                  runtimeLogger.error(`${plugin.packageName} had error transforming item id ${item.id}`);
                  throw error;
                }
              },
              itemDry
            );

            // TODO item level try...catch

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

  // TODO error handling logic needs update
  const validFeeds = feeds.filter(isValidFeed);

  const finalizedOutput = await reduceAsync(
    buildEndPlugins,
    async (buildOutput, plugin) => {
      const data: BuildEndHookData = {
        pluginId: plugin.packageName,
        feeds: buildOutput.feeds,
        projectConfig,
      };
      const api: BuildEndHookApi = {
        storage: new StorageApi({ pluginPackageName: plugin.packageName }),
        log: new LogApi(),
      };

      try {
        return await plugin.buildEnd!({ data, api });
      } catch (error) {
        runtimeLogger.error(`${plugin.packageName} had error in build end step`);
        throw error;
      }
    },
    {
      feeds: validFeeds,
    } as ProjectOutput
  );

  // TODO remove any plugin folders that were not in use

  return {
    feeds: finalizedOutput.feeds,
    ...(feedsErrors.length ? { errors: feedsErrors } : {}),
  };
}
