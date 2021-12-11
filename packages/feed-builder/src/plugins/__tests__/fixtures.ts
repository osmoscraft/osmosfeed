import { ItemHookData, ItemHookInput, Plugin } from "../../types";

export function runOnItemHook(plugin: Plugin, input: ItemHookInput) {
  return plugin.onItem!(input);
}

export interface SingleItemMockInput {
  url?: string;
  id: string;
  _plugin?: any;
}
export function mockDataForSingleItem(input: SingleItemMockInput): ItemHookData {
  return {
    pluginId: "",
    item: {
      id: input.id,
      url: input.url,
      _plugin: input._plugin,
    },
    feed: {
      version: "",
      title: "",
      items: [
        {
          id: input.id,
          url: input.url,
        },
      ],
    },
    sourceConfig: {
      url: "https://mock-domain/feed.xml",
    },
    projectConfig: {
      sources: [
        {
          url: "https://mock-domain/feed.xml",
        },
      ],
    },
  };
}
