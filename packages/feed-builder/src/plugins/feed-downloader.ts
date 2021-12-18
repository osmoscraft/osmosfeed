import { Plugin } from "../types/plugin";

export const id = "47764e9f-4327-4be7-8584-e8307ba08170";
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
