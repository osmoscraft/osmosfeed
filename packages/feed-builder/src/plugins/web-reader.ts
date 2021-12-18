import { Plugin } from "../types/plugin";
import { App, EmbeddedMediaFile, EmbeddedTextFile } from "@osmosfeed/web-reader";

export interface WebReaderConfig {
  scripts: EmbeddedTextFile[];
  stylesheets: EmbeddedTextFile[];
  favicon: EmbeddedMediaFile;
}
export function useWebReader(config: WebReaderConfig): Plugin {
  return {
    packageName: "@osmosfeed/web-reader",
    buildEnd: async ({ data, api }) => {
      const html = App({
        data: data.feeds,
        embeddedScripts: config.scripts,
        embeddedStylesheets: config.stylesheets,
        embeddedFavicon: config.favicon,
      });

      await api.storage.writeFile("index.html", html);

      return data;
    },
  };
}
