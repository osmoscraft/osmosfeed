import Parser from "rss-parser";
import { getNonEmptyStringOrNull } from "../utils/ensure-string-content";
import { resolveRelativeUrl } from "../utils/url";

export interface ParsedFeed {
  link: string | null;
  title: string | null;
  items: ParsedFeedItem[];
}

export interface ParsedFeedItem {
  guid: string | null;
  title: string | null;
  link: string | null;
  isoDate: string | null;
  creator: string | null;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  itunes?: {
    duration: string;
  };
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
}

export function normalizeFeed(feed: Parser.Output<CustomFields>, feedUrl: string): ParsedFeed {
  return {
    link: getNonEmptyStringOrNull(feed.link),
    title: getNonEmptyStringOrNull(feed.title),
    items: feed.items.map((item) => {
      const thumbnailImage = getNonEmptyStringOrNull(item["media:thumbnail"]);
      const enclosureImage = item.enclosure?.type.startsWith("image/")
        ? getNonEmptyStringOrNull(item.enclosure.url)
        : null;
      const link = getNonEmptyStringOrNull(item.link);
      const imageUrl = thumbnailImage ?? enclosureImage;

      return {
        content: getNonEmptyStringOrNull(item.contentSnippet),
        creator: getNonEmptyStringOrNull(item.creator),
        guid: getNonEmptyStringOrNull(item.guid),
        isoDate: getNonEmptyStringOrNull(item.isoDate),
        link: link ? resolveRelativeUrl(link, feedUrl) : null,
        summary: getNonEmptyStringOrNull(item.summary),
        title: getNonEmptyStringOrNull(item.title),
        imageUrl: imageUrl ? resolveRelativeUrl(imageUrl, feedUrl) : null,
        ...getItunesFields(item),
      };
    }),
  };
}

function getItunesFields(itunesItem: CustomFields) {
  const itunes = itunesItem.itunes
    ? {
        duration: itunesItem.itunes.duration,
      }
    : undefined;

  const enclosure = itunesItem.enclosure
    ? {
        ...itunesItem.enclosure,
      }
    : undefined;

  return {
    itunes,
    enclosure,
  };
}

interface CustomFields {
  itunes?: {
    duration: string;
  };
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
  "media:thumbnail": string;
}
