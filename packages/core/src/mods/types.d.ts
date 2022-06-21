export interface PipeFeed {
  cache?: Error | NormalizedFeed;
  config?:
    | Error
    | {
        url: string;
      };
  download?:
    | Error
    | {
        content: string;
        mediaType: string | null;
      };
  jsonFeed?: Error | JsonFeed;
  normalizedFeed?: Error | NormalizedFeed;
}

export type JsonFeed<FeedExtensionsType = {}, ItemExtensionsType = {}> = {
  version: string;
  title: string;
  description?: string;
  home_page_url?: string;
  icon?: string;
  feed_url?: string;
  items: JsonFeedItem<ItemExtensionsType>[];
} & FeedExtensionsType;

export type JsonFeedItem<ItemExtensionsType = {}> = {
  id: string;
  url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  date_published?: string;
  date_modified?: string;
  summary?: string;
  image?: string;
} & ItemExtensionsType;

export type NormalizedFeed = JsonFeed<{ feed_url: string }, { date_published: string }>;
export type NormalizedItem = JsonFeedItem<{ date_published: string }>;
