import assert from "assert";
import type { FeedTask, ItemTask } from "../engine/build";
import type { ParseItemExt } from "./parse";
import type { JsonFeed, JsonFeedItem, TaskContext } from "./types";

export interface FaviconConfig {
  provider: "duckduckgo" | "yandex" | "google";
}

export function feedFavicon(config?: FaviconConfig): FeedTask<JsonFeed> {
  return async (feed, context) => {
    assert(feed.feed_url, "url is missing");

    const provider = config?.provider ?? "duckduckgo";
    let corsProxyIconUrl = getCorsUrl(new URL(feed.feed_url).hostname, provider);

    return {
      ...feed,
      icon: feed.icon ?? corsProxyIconUrl,
    };
  };
}

export function itemFavicon(config?: FaviconConfig): ItemTask<JsonFeedItem & ParseItemExt, TaskContext> {
  return async (item, context) => {
    assert(item.url, "url is missing");

    const provider = config?.provider ?? "duckduckgo";
    let corsProxyIconUrl = getCorsUrl(new URL(item.url).hostname, provider);

    return {
      ...item,
      _extIcon: item?._extIcon ?? corsProxyIconUrl,
    };
  };
}

function getCorsUrl(hostname: string, provider: string) {
  switch (provider) {
    case "duckduckgo":
      return `https://icons.duckduckgo.com/ip2/${hostname}.ico`;
    case "yandex":
      return `https://favicon.yandex.net/favicon/${hostname}`;
    case "google":
      return `http://www.google.com/s2/favicons?domain=${hostname}`;
  }
}
