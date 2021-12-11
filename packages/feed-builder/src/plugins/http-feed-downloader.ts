import { Plugin } from "../types/plugin";

export function useHttpFeedDownloader(): Plugin {
  return {
    id: "47764e9f-4327-4be7-8584-e8307ba08170",
    name: "HTTP Feed Downloader",
    onFeed: async ({ data, api }) => {
      const result = await api.httpGet({ url: data.sourceConfig.url });

      // TODO error handling
      api.setTempData("text", result.buffer.toString("utf8"));
      return data.feed;
    },
  };
}

export const id = "47764e9f-4327-4be7-8584-e8307ba08170";
