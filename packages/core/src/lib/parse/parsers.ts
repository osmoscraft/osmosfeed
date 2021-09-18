import type { Element, Node } from "cheerio";
import cheerio, { Cheerio } from "cheerio";
import { ElementType } from "htmlparser2";
import type { XmlFeedParser } from "./parse-feed";

export const rssParser: XmlFeedParser = {
  isMatch: (root) => root.find("rss,rdf\\:RDF").length > 0,
  selectChannel: (root) => root.find("channel"),
  selectItems: (root) => root.find("item"),
  resolveChannel: (channel) => {
    const publishDate = coerceEmptyString(channel.find("pubDate,dc\\:date").first().text());
    const modifiedhDate = coerceEmptyString(channel.find("lastBuildDate,dc\\:date").first().text());

    return {
      version: "https://jsonfeed.org/version/1.1",
      title: decodeXmlText(channel.find("title")).text(),
      description: coerceEmptyString(decodeXmlText(channel.find("description")).text()),
      home_page_url: coerceEmptyString(channel.find("link").text()),
      icon:
        coerceEmptyString(channel.find("image url").text()) ??
        channel.find("image[rdf\\:resource]").attr("rdf:resource"),
      _date_published: coerceError(() => new Date(publishDate ?? modifiedhDate ?? "").toISOString()),
      _date_modified: coerceError(() => new Date(modifiedhDate ?? publishDate ?? "").toISOString()),
    };
  },
  resolveItem: (item, _channel) => {
    const decodedTitle = decodeXmlText(item.find("title"));
    const decodedSummary = decodeXmlText(item.find("description"));
    const decodedContent = decodeXmlText(item.find("content\\:encoded"));
    const date = coerceEmptyString(item.find("pubDate,dc\\:date").first().text());

    return {
      id: coerceEmptyString(item.find("guid").text()) ?? coerceEmptyString(item.find("link").text()) ?? "",
      url: coerceEmptyString(item.find("link").text()),
      title: coerceEmptyString(decodedTitle.text()),
      summary: coerceEmptyString(decodedSummary.text()) ?? coerceEmptyString(decodedContent.text()),
      content_html: coerceEmptyString(decodedContent.html()) ?? coerceEmptyString(decodedSummary.html(), ""),
      content_text: coerceEmptyString(decodedContent.text()) ?? coerceEmptyString(decodedSummary.text(), ""),
      image:
        item.find(`enclosure[type^="image"]`).attr("url") ??
        item.find(`enc\\:enclosre[enc\\:type^="image"]`).attr("rdf:resource") ??
        undefined,
      date_published: coerceError(() => new Date(date ?? "").toISOString()),
      date_modified: coerceError(() => new Date(date ?? "").toISOString()),
    };
  },
};

export const atomParser: XmlFeedParser = {
  isMatch: (root) => root.find("feed").length > 0,
  selectChannel: (root) => root.find("feed"),
  selectItems: (root) => root.find("entry"),
  resolveChannel: (channel) => {
    const date = coerceEmptyString(channel.find("updated").text());

    return {
      version: "https://jsonfeed.org/version/1.1",
      title: decodeAtomText(channel.find("title")).text(),
      description: coerceEmptyString(decodeAtomText(channel.find("subtitle")).text()),
      home_page_url: channel.find("link").attr("href"),
      icon: coerceEmptyString(channel.find("icon").text()),
      _date_published: date ? coerceError(() => new Date(date).toISOString()) : undefined,
      _date_modified: date ? coerceError(() => new Date(date).toISOString()) : undefined,
    };
  },
  resolveItem: (item: Cheerio<Element>, _channel: Cheerio<Element>) => {
    const decodedTitle = decodeAtomText(item.find("title"));
    const decodedSummary = decodeAtomText(item.find("summary"));
    const decodedContent = decodeAtomText(item.find("content"));
    const publishedDate = coerceEmptyString(item.find("published").text());
    const modifedDate = coerceEmptyString(item.find("updated").text());

    return {
      id: coerceEmptyString(item.find("id").text()) ?? item.find("link").attr("href") ?? "",
      url: item.find("link").attr("href"),
      title: coerceEmptyString(decodedTitle.text()),
      summary: coerceEmptyString(decodedSummary.text()) ?? coerceEmptyString(decodedContent.text()),
      content_html: coerceEmptyString(decodedContent.html()) ?? coerceEmptyString(decodedSummary.html(), ""),
      content_text: coerceEmptyString(decodedContent.text()) ?? coerceEmptyString(decodedSummary.text(), ""),
      image: item.find(`link[rel="enclosure"][type^="image"]`).attr("href"),
      date_published: coerceError(() => new Date(publishedDate ?? modifedDate ?? "").toISOString()),
      date_modified: coerceError(() => new Date(modifedDate ?? publishedDate ?? "").toISOString()),
    };
  },
};

function $hasCdata($: Cheerio<Node>) {
  return $.toArray().some(elementHasCdata);
}

function elementHasCdata(node: Node) {
  return (node as Element)?.children.some((c) => c.type === ElementType.CDATA);
}

function decodeAtomText($: Cheerio<Node>) {
  const type = $.attr("type");
  switch (type) {
    case "html":
      return decodeXmlText($);
    case "xhtml":
      return decodeXmlText($.find("div").first());
    case "text":
    default:
      return {
        html: () => escapeXmlText($.html()?.trim() ?? ""),
        text: () => $.html()?.trim() ?? "",
      };
  }
}

function decodeXmlText($: Cheerio<Node>): { html: () => string; text: () => string } {
  const _getHtml = () => ($hasCdata($) ? $.text().trim() : $.html()?.trim() ?? "");
  const _getText = () => cheerio.load(_getHtml()).text();

  return {
    html: _getHtml,
    text: _getText,
  };
}

function escapeXmlText(input: string): string {
  return input.replace(/[<>&'"]/g, (c: string) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return ""; // unreachable
    }
  });
}

function coerceEmptyString<T = undefined>(maybeEmptyString: string, coerceTo?: T): string | T {
  if (!maybeEmptyString) return coerceTo as T;
  return maybeEmptyString;
}

function coerceError<T>(fn: () => T, coerceTo = undefined) {
  try {
    return fn();
  } catch {
    return coerceTo;
  }
}
