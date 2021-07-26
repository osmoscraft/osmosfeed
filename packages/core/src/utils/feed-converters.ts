import cheerio, { BasicAcceptedElems, Cheerio, CheerioAPI, Element, Node } from "cheerio";
import { ElementType } from "htmlparser2";

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
  content_text?: string;
  summary?: string;
}

export function atomToJsonFeed($: CheerioAPI) {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: decode($("feed title")).text(),
    home_page_url: $("feed link").attr("href"),
    feed_url: "", // TBD
    items: [...$("entry")].map((element) => {
      const item$ = withContext($, element);
      const description = decodeAtomElement(item$("summary"));
      const content = decodeAtomElement(item$("content"));

      return {
        id: "",
        title: decode(item$("title")).text(),
        url: item$("link").attr("href"),
        summary: getNonEmptyString(description.text, content.text),
        content_text: getNonEmptyString(content.text, description.text),
        content_html: getNonEmptyString(content.html, description.html),
      };
    }),
  };
}

export function rdfToJsonFeed($: CheerioAPI) {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: decode($("channel title")).text(),
    home_page_url: $("channel link").text(),
    feed_url: "", // TBD
    items: [...$("item")].map((element) => {
      const item$ = withContext($, element);
      const description = decode(item$("description"));
      const content = decode(item$("content\\:encoded"));

      return {
        id: "",
        title: decode(item$("title")).text(),
        url: item$("link").text(),
        summary: getNonEmptyString(description.text, content.text),
        content_text: getNonEmptyString(content.text, description.text),
        content_html: getNonEmptyString(content.html, description.html),
      };
    }),
  };
}

export function rssToJsonFeed($: CheerioAPI): JsonFeed {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: decode($("channel title")).text(),
    home_page_url: $("channel link").text(),
    feed_url: "", // TODO fill with user provided feed url
    items: [...$("item")].map((element) => {
      const item$ = withContext($, element);
      const description = decode(item$("description"));
      const content = decode(item$("content\\:encoded"));

      return {
        id: "",
        title: decode(item$("title")).text(),
        url: item$("link").text(),
        summary: getNonEmptyString(description.text, content.text),
        content_text: getNonEmptyString(content.text, description.text),
        content_html: getNonEmptyString(content.html, description.html),
      };
    }),
  };
}

function withContext($: CheerioAPI, context: BasicAcceptedElems<Node>) {
  const fnWithContext = (...args: Parameters<CheerioAPI>) => {
    if (!args[1]) {
      args[1] = context;
    }

    return $(...args);
  };

  return fnWithContext as CheerioAPI;
}

function getNonEmptyString(...stringGetters: (() => string)[]) {
  for (let fn of stringGetters) {
    const value = fn();
    if (value) return value;
  }

  return "";
}

function $hasCdata($: Cheerio<Node>) {
  return $.toArray().some(elementHasCdata);
}

function elementHasCdata(node: Node) {
  return (node as Element)?.children.some((c) => c.type === ElementType.CDATA);
}

function decodeAtomElement($: Cheerio<Node>) {
  const type = $.attr("type");
  switch (type) {
    case "html":
      return decode($);
    case "xhtml":
      throw new Error("xhtml type handling is not implemented yet"); // TBD
    case "text":
    default:
      return {
        html: () => $.html() ?? "",
        text: () => $.text(),
      };
  }
}

function decode($: Cheerio<Node>): { html: () => string; text: () => string } {
  const _getHtml = () => ($hasCdata($) ? $.text() : $.html() ?? "");
  const _getText = () => cheerio.load(_getHtml()).text();

  return {
    html: _getHtml,
    text: _getText,
  };
}
