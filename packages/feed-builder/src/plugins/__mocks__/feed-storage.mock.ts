import type { JsonFeed } from "@osmosfeed/types";

export function getFeedStorageData(): JsonFeed {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: "Mock title",
    description: "Mock description",
    home_page_url: "https://mock-domain/index.html",
    items: [
      {
        id: "mock-item-1",
        url: "https://mock-domain/item-1.html",
        title: "Mock item 1 title",
        summary: "Mock summary",
        content_html: "",
        content_text: "",
        date_published: "2021-12-14T17:00:35.000Z",
        date_modified: "2021-12-14T17:50:36.000Z",
        _plugin: {
          pageFilename: "mockItem1.html",
        },
      },
    ],
    _ext: {
      date_published: "2022-01-06T16:51:56.000Z",
      date_modified: "2022-01-06T16:51:56.000Z",
    },
    feed_url: "https://mock-domain/feed.xml",
  };
}
