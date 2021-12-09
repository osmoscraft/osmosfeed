import { JsonFeed } from "@osmoscraft/osmosfeed-types";
import { ProjectConfig, SourceConfig } from "@osmoscraft/osmosfeed-types/project-config";
import { PartialJsonFeed, PartialProjectConfig, PartialSourceConfig, Plugins } from "./sdk";

// Implement unit test util plugins to help output other plugins
// Implement runtime that invokes plugins
//

export interface FeedBuilderConfig {
  plugins: Plugins;
}

export async function build({ plugins }: FeedBuilderConfig) {
  const { configPlugins: sourcesPlugins = [], feedPlugins: feedPlugins = [], itemPlugins: itemPlugins = [] } = plugins;

  // TODO error handling
  // TODO test error handling
  const projectConfig = await reduceAsync(
    sourcesPlugins,
    (config, plugin) => plugin({ config }),
    {} as PartialProjectConfig
  );

  if (!isProjectConfig(projectConfig)) throw new ProjectConfigError(); // TODO Add a catch all plugin to ensure correctness

  const feeds = await Promise.all(
    (projectConfig.sources ?? []).map(async (sourceConfig) => {
      const feedBase = await reduceAsync(
        feedPlugins,
        (feed, plugin) => plugin({ feed, sourceConfig, projectConfig }),
        {} as PartialJsonFeed
      );

      if (!isFeed(feedBase)) throw new FeedFormatError(); // TODO Add a catch all plugin to ensure correctness

      const itemsBase = feedBase.items ?? [];
      const itemsEnriched = await Promise.all(
        itemsBase.map(async (itemDry) => {
          const itemEnriched = await reduceAsync(
            itemPlugins,
            (item, plugin) => plugin({ item, feed: feedBase, sourceConfig, projectConfig }),
            itemDry
          );

          return itemEnriched;
        })
      );

      return { ...feedBase, items: itemsEnriched };
    })
  );

  return feeds;
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
