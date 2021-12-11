import { Plugin } from "../types/plugin";

export const id = "47764e9f-4327-4be7-8584-e8307ba08170";
export function useFeedDownloader(): Plugin {
  return {
    id,
    name: "Feed Downloader",
    onFeed: async ({ data, api }) => {
      const result = await api.httpGet(data.sourceConfig.url);

      // TODO TDD to handle xml/atom vs json feed types
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
