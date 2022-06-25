export type Item = JsonFeedItem<JsonFeedItemExt>;

export type JsonFeedItemExt = {
  _context: {
    feed: Feed;
    project: Project;
  };
};

export type Feed = JsonFeed<JsonFeedExt, JsonFeedItemExt>;

export type JsonFeedExt = {
  _context: {
    project: Project;
  };
};

export interface Project {
  siteTitle: string;
}

export type JsonFeed<FeedExtensionsType = {}, ItemExtensionsType = {}> = {
  version: string;
  title: string;
  description?: string;
  home_page_url?: string;
  icon?: string;
  feed_url?: string;
  items: JsonFeedItem<ItemExtensionsType>[];
  [key: string]: any;
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
  [key: string]: any;
} & ItemExtensionsType;

export type NormalizedFeed = JsonFeed<{ feed_url: string }, { date_published: string }>;
export type NormalizedItem = JsonFeedItem<{ date_published: string }>;

export interface MergeFeedSummary extends MergeItemsSummary {
  feed: NormalizedFeed;
}

export interface MergeItemsSummary {
  items: NormalizedItem[];
  added: number;
  updated: number;
  unchanged: number;
  removed: number;
}
