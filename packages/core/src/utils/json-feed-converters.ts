import { Cheerio, CheerioAPI, Node } from "cheerio";

export interface JsonFeed {
  version: string;
  title: string;
  home_page_url?: string;
  feed_url?: string;
  items: JsonFeedItem[];
}

export interface JsonFeedItem {
  id: string;
  url?: string;
  title?: string;
  content_html?: string;
  context_text?: string;
  summary?: string;
}

export abstract class AbstractJsonFeedConverter {
  constructor(protected $: CheerioAPI) {}

  convert(): JsonFeed {
    return {
      ...this.transformMetadata(this.$),
      ...this.transformChannel(this.$),
      items: this.transformItems(this.$),
    };
  }

  abstract getItems(): Cheerio<Node>;

  abstract transformMetadata($: CheerioAPI): Record<string, any>;
  abstract transformChannel($: CheerioAPI): any;
  abstract transformItems($: CheerioAPI): any;
}

export class RssToJsonFeedConverter extends AbstractJsonFeedConverter {
  getItems() {
    return this.$("item");
  }

  transformMetadata() {
    return {
      version: "https://jsonfeed.org/version/1.1",
    };
  }

  transformChannel($: CheerioAPI) {
    return {
      title: $("rss channel title").html(),
      home_page_url: "",
      feed_url: "",
    };
  }

  transformItems($: CheerioAPI) {
    return [];
  }
}
