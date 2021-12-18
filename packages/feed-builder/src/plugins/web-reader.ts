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
    buildEnd: async ({ data }) => {
      const html = App({
        data: data.feeds,
        embeddedScripts: config.scripts,
        embeddedStylesheets: config.stylesheets,
        embeddedFavicon: config.favicon,
      });

      // await concurrentWrite([{ fromMemory: html, toPath: path.join(cwd, "index.html") }]);

      return data;
    },
  };
}
