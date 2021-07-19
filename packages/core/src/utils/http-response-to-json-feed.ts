import { XMLSerializedAsObject, XMLSerializedAsObjectArray } from "xmlbuilder2/lib/interfaces";
import { parseXml } from "./parse-xml.js";

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

export interface HttpResponseToJsonFeedInput {
  contentType: string;
  raw: string;
}

export class InvalidFeedMimeTypeError extends Error {}
export class InvalidXmlStructureError extends Error {}

export function httpResponseToJsonFeed(input: HttpResponseToJsonFeedInput): JsonFeed {
  switch (input.contentType) {
    case "application/xml":
    case "application/rss+xml":
    case "text/xml":
    case "application/atom+xml":
      return parseXmlFeed(input.contentType, parseXml(input.raw));
    case "application/json":
      return JSON.parse(input.raw);
    default:
      throw new InvalidFeedMimeTypeError(input.contentType);
  }
}

function parseXmlFeed(contentType: string, xmlObject: XMLSerializedAsObject | XMLSerializedAsObjectArray): JsonFeed {
  if (!ensureSingleRoot(xmlObject)) throw new InvalidXmlStructureError();

  if (contentType === "application/atom+xml") {
    return parseAtom(xmlObject);
  } else {
    return parseRss(xmlObject);
  }
}

function parseRss(xmlObject: XMLSerializedAsObject): JsonFeed {
  const channelTitle = (xmlObject as any)?.rss?.channel?.title;
  const homePageUrl = (xmlObject as any)?.rss?.channel?.link;

  const items = arrayify((xmlObject as any)?.rss?.channel?.item).map(parseRssItem);

  return {
    version: "https://jsonfeed.org/version/1.1",
    title: channelTitle,
    home_page_url: homePageUrl,
    items,
  };
}

function parseRssItem(item: any): JsonFeedItem {
  return {
    id: "PLACEHOLDER",
    title: item?.title,
    url: item?.link,
    summary: item?.description,
  };
}

function parseAtom(xmlObject: XMLSerializedAsObject): JsonFeed {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: "",
    items: [],
  };
}

function ensureSingleRoot(
  xmlObject: XMLSerializedAsObject | XMLSerializedAsObjectArray
): xmlObject is XMLSerializedAsObject {
  return !Array.isArray(xmlObject);
}

function arrayify(maybeArray: any) {
  if (maybeArray === undefined) return [];
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}
