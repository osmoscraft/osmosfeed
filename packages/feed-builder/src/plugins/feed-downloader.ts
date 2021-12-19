import { Plugin } from "../types/plugin";

export function useFeedDownloader(): Plugin {
  return {
    packageName: "@osmosfeed/downloader",
    transformFeed: async ({ data, api }) => {
      api.log.trace(`Download feed ${data.sourceConfig.url}`);
      const result = await api.network.get(data.sourceConfig.url);

      // TODO TDD to handle xml/atom vs json feed types
      // TODO add timeout and retry logic
      // TODO error handling
      return {
        ...data.feed,
        _plugin: {
          ...data.feed._plugin,
          rawFeed: result.buffer.toString("utf8"),
        },
      };
    },
  };
}
