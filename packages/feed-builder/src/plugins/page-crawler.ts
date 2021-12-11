import { Plugin } from "../types";

export function usePageCrawler(): Plugin {
  return {
    id: "8f0cb682-827a-41b6-a9d1-21b2b5e33284",
    name: "Page Crawler",
    onItem: async ({ data }) => {
      return data.item;
    },
  };
}
