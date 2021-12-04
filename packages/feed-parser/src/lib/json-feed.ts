export interface JsonFeed {
  version: string;
  title: string;
  description?: string;
  home_page_url?: string;
  icon?: string;
  feed_url?: string;
  items: JsonFeedItem[];
  _ext: {
    parser_version: string;
    date_published?: string;
    date_modified?: string;
  };
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
