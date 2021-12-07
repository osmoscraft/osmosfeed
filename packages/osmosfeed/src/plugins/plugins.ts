import { JsonFeed, JsonFeedItem } from "@osmoscraft/osmosfeed-types";

export interface Plugins {
  onFeeds?: FeedsPlugin[];
  onFeed?: FeedPlugin[];
  onItem?: ItemPlugin[];
  onItemEnd?: ItemPlugin[];
  onFeedEnd?: FeedPlugin[];
  onFeedsEnd?: FeedsPlugin[];
}

export type FeedsPlugin = (input: { feeds: Partial<JsonFeed>[] }) => Promise<Partial<JsonFeed>[]>;
export type FeedPlugin = (input: { feed: Partial<JsonFeed>; feeds: Partial<JsonFeed>[] }) => Promise<Partial<JsonFeed>>;
export type ItemPlugin = (input: {
  item: Partial<JsonFeedItem>;
  feed: Partial<JsonFeed>;
  feeds: Partial<JsonFeed>[];
}) => Promise<Partial<JsonFeedItem>>;

// Implement unit test util plugins to help output other plugins
// Implement runtime that invokes plugins
const plugins: Plugins = {
  onFeeds: [inlineSourcesPlugin({ urls: ["https://www.example.com"] })],
  onFeed: [feedDownloadPlugin(), feedParserPlugin()],
  onItem: [],
};

export function feedParserPlugin(): FeedPlugin {
  const plugin: FeedPlugin = async (input) => {
    const { feed } = input;

    const html = feed._feed_download_plugin?.raw;
    if (!html) return feed;

    const parsedFeed: Partial<JsonFeed> = {
      ...feed,
      title: "hello",
      items: [],
    };

    return parsedFeed;
  };

  return plugin;
}

export function feedDownloadPlugin(): FeedPlugin {
  const plugin: FeedPlugin = async (input) => {
    const { feed } = input;
    const url = feed.feed_url;
    if (!url) return feed;

    const downloadedFeed: Partial<JsonFeed> = {
      ...feed,
      _feed_download_plugin: {
        raw: "hello world",
      },
    };

    return downloadedFeed;
  };

  return plugin;
}

export interface InlineSourcesPluginConfig {
  urls: string[];
}
export function inlineSourcesPlugin(config: InlineSourcesPluginConfig): FeedsPlugin {
  const jsonFeeds: Partial<JsonFeed>[] = config.urls.map((url) => ({ feed_url: url }));

  const plugin: FeedsPlugin = async () => {
    return jsonFeeds;
  };

  return plugin;
}
