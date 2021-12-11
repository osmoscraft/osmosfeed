import { ItemHookData, ItemHookInput, Plugin } from "../../types";

export function runOnItemHook(plugin: Plugin, input: ItemHookInput) {
  return plugin.onItem!(input);
}

export interface SingleItemMockInput {
  url?: string;
  id: string;
}
export function mockDataForSingleItem(input: SingleItemMockInput): ItemHookData {
  return {
    pluginId: "",
    item: {
      id: input.id,
      url: input.url,
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
