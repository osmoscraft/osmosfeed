import { PartialJsonFeed, Plugins } from "./plugins";

export async function run(plugins: Plugins) {
  const { onFeeds: onFeedsPlugins = [], onFeed: onFeedPlugins = [], onItem: onItemPlugins = [] } = plugins;

  // TODO error handling
  // TODO test error handling
  const feedsDry = await reduceAsync(onFeedsPlugins, (feeds, plugin) => plugin({ feeds }), [] as PartialJsonFeed[]);

  const feedsHydrated = await Promise.all(
    feedsDry.map(async (resultFeedDry) => {
      const feedHydrated = await reduceAsync(
        onFeedPlugins,
        (feed, plugin) => plugin({ feed, feeds: feedsDry }),
        resultFeedDry
      );

      const itemsDry = feedHydrated.items ?? [];
      const itemsHydrated = await Promise.all(
        itemsDry.map(async (itemDry) => {
          const itemHydrated = await reduceAsync(
            onItemPlugins,
            (item, plugin) => plugin({ item, feed: feedHydrated, feeds: feedsDry }),
            itemDry
          );

          return itemHydrated;
        })
      );

      return { ...feedHydrated, items: itemsHydrated };
    })
  );

  return feedsHydrated;
}

async function reduceAsync<T, P>(values: T[], reducer: (prev: P, current: T) => Promise<P>, initial: P) {
  let result: P = initial;
  for (let value of values) {
    result = await reducer(result, value);
  }
  return result;
}
