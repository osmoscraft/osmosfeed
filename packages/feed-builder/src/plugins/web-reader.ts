import { App } from "@osmosfeed/web-reader";
import { Plugin } from "../types/plugin";
import { mimeMap } from "./lib/mime-map";

export function useWebReader(): Plugin {
  return {
    packageName: "@osmosfeed/web-reader",
    buildEnd: async ({ data, api }) => {
      const scriptBuffer = await api.storage.readPluginStaticFile("index.js");
      const mercuryBuffer = await api.storage.readPluginStaticFile("mercury.web.js");
      const stylesheetBuffer = await api.storage.readPluginStaticFile("index.css");
      const faviconBuffer = await api.storage.readPluginStaticFile("favicon.png");

      const html = App({
        data: data.feeds,
        embeddedScripts: [
          ...(scriptBuffer ? [{ content: scriptBuffer.toString("utf-8") }] : []),
          ...(mercuryBuffer ? [{ content: mercuryBuffer?.toString("utf-8") }] : []),
        ],
        embeddedStylesheets: stylesheetBuffer ? [{ content: stylesheetBuffer.toString("utf-8") }] : [],
        embeddedFavicon: faviconBuffer ? { content: faviconBuffer, mime: mimeMap[".png"] } : undefined,
      });

      await api.storage.writeFile("index.html", html);

      return data;
    },
  };
}
