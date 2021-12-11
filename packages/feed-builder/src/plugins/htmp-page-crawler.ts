import { Plugin } from "../types";
import { mimeMap } from "./lib/mime-map";
import { sha256 } from "./lib/sha256";

export function useHtmlPageCrawler(): Plugin {
  return {
    id: "8f0cb682-827a-41b6-a9d1-21b2b5e33284",
    name: "HTML Page Crawler",
    onItem: async ({ data, api }) => {
      const { url } = data.item;

      if (!url) {
        return data.item;
      }
      const filename = `${sha256(url)}.html`;

      const cachedContent = await api.getTextFile(filename);
      if (cachedContent) {
        return {
          ...data.item,
          _plugin: {
            ...data.item._plugin,
            pageFilename: filename,
          },
        };
      }

      const res = await api.httpGet(url);

      if (!res.contentType?.includes(mimeMap[".html"])) {
        return data.item;
      }

      // Assuming http client cannot handle cache.
      if (res.statusCode !== 200) {
        return data.item;
      }

      const content = res.buffer;
      await api.setFile(filename, content);

      return {
        ...data.item,
        _plugin: {
          ...data.item._plugin,
          pageFilename: filename,
        },
      };
    },
  };
}
