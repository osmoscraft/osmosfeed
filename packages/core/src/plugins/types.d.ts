export interface Project {
  outDir: string;
  feeds: JsonFeed[];
  githubServerUrl: string | null;
  githubRepository: string | null;
  githubRunId: string | null;
  githubPageUrl: string;
  siteTitle: string;
  timezoneOffset: number;
  [key: string]: any;
}

export interface JsonFeed {
  version: string;
  title: string;
  description?: string;
  home_page_url?: string;
  icon?: string;
  feed_url?: string;
  items: JsonFeedItem[];
  [key: string]: any;
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
  [key: string]: any;
}
