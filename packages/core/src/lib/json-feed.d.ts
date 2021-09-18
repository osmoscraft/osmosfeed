export interface JsonFeed extends JsonFeedChannel {
  items: JsonFeedItem[];
}

export interface JsonFeedChannel {
  version: string;
  title: string;
  description?: string;
  home_page_url?: string;
  icon?: string;
  feed_url?: string;
  _date_published?: string;
  _date_modified?: string;
}

export interface JsonFeedItem {
  id: string;
  url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  date_published?: string;
  date_modified?: string;
  summary?: string;
  image?: string;
}
