import { JsonFeed, JsonFeedItem } from "@osmosfeed/types";
import {
  BuildEndHookData,
  BuildEndHookInput,
  FeedHookData,
  FeedHookInput,
  ItemHookData,
  ItemHookInput,
  Plugin,
} from "../../types";

export function runTransformFeedHook(plugin: Plugin, input: FeedHookInput) {
  return plugin.transformFeed!(input);
}

export function runTransformItemHook(plugin: Plugin, input: ItemHookInput) {
  return plugin.transformItem!(input);
}

export function runBuildEndHook(plugin: Plugin, input: BuildEndHookInput) {
  return plugin.buildEnd!(input);
}

export interface MockFeedInput {
  feed: Partial<JsonFeed>;
}

export function mockDataForFeed(input: MockFeedInput): FeedHookData {
  return {
    pluginId: "",
    feed: {
      version: "",
      title: "",
      feed_url: "https://mock-domain/feed.xml",
      ...input.feed,
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

export function mockDataForSingleItemBuildEnd(input: SingleItemMockInput): BuildEndHookData {
  const mockData = mockDataForSingleItem(input);
  return {
    pluginId: "",
    feeds: [mockData.feed],
    projectConfig: mockData.projectConfig,
  };
}
