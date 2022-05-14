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
