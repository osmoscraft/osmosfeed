import type { AnyNode, Cheerio, Document, Element } from "cheerio";
import * as cheerio from "cheerio";
import * as htmlparser2 from "htmlparser2";
import { ElementType } from "htmlparser2";
import type { JsonFeed, JsonFeedItem } from "../../types";

export interface LanguageParser {
  match: (root: Cheerio<Document>) => boolean;
  selectChannel: (root: Cheerio<Document>) => Cheerio<Element>;
  parseChannel: (channelElement: Cheerio<Element>) => JsonFeed;
  selectItems: (root: Cheerio<Document>) => Cheerio<Element>;
  parseItem: (itemElement: Cheerio<Element>, channelElement: Cheerio<Element>) => JsonFeedItem;
}

export async function parse(xml: string): Promise<JsonFeed> {
  const dom = htmlparser2.parseDocument(xml, { xmlMode: true, decodeEntities: true });
  const $ = cheerio.load(dom, { xmlMode: true, decodeEntities: false });
  const root = $.root();

  const parsers: LanguageParser[] = [rssParser, atomParser];

  const parser = parsers.find((parser) => parser.match(root));
  if (!parser) throw new Error("No parser found");

  const { selectChannel, parseChannel: resolveChannel, selectItems, parseItem } = parser;
  const channelElement = selectChannel(root);
  const results = {
    ...resolveChannel(channelElement),
    items: selectItems(root)
      .toArray()
      .map((itemElement) => parseItem($(itemElement), channelElement)),
  };

  return results;
}

const rssParser: LanguageParser = {
  match: (root) => root.find("rss,rdf\\:RDF").length > 0,
  selectChannel: (root) => root.find("channel"),
  selectItems: (root) => root.find("item"),
  parseChannel: (channel) => {
    return {
      version: "https://jsonfeed.org/version/1.1",
      title: parseXmlNode(channel.find("> title")).text(),
      description: coerceEmptyString(parseXmlNode(channel.find("> description")).text()),
      home_page_url: coerceEmptyString(channel.find("> link").text()),
      icon:
        coerceEmptyString(channel.find("> image url").text()) ??
        channel.find("image[rdf\\:resource]").attr("rdf:resource"),
      items: [],
    };
  },
  parseItem: (item, _channel) => {
    const decodedTitle = parseXmlNode(item.find("> title"));
    const decodedSummary = parseXmlNode(item.find("> description"));
    const decodedContent = parseXmlNode(item.find("> content\\:encoded"));
    const date = coerceEmptyString(item.find("> pubDate,> dc\\:date").first().text());

    return {
      id: coerceEmptyString(item.find("> guid").text()) ?? coerceEmptyString(item.find("> link").text()) ?? "",
      url: coerceEmptyString(item.find("> link").text().trim()),
      title: coerceEmptyString(decodedTitle.text()),
      summary: coerceEmptyString(decodedSummary.text()) ?? coerceEmptyString(decodedContent.text()),
      content_html: coerceEmptyString(decodedContent.html()) ?? coerceEmptyString(decodedSummary.html(), ""),
      content_text: coerceEmptyString(decodedContent.text()) ?? coerceEmptyString(decodedSummary.text(), ""),
      image:
        item.find(`> enclosure[type^="image"]`).attr("url") ??
        item.find(`> enc\\:enclosure[enc\\:type^="image"]`).attr("rdf:resource") ??
        undefined,
      date_published: coerceError(() => new Date(date ?? "").toISOString()),
    };
  },
};

const atomParser: LanguageParser = {
  match: (root) => root.find("feed").length > 0,
  selectChannel: (root) => root.find("feed"),
  selectItems: (root) => root.find("entry"),
  parseChannel: (channel) => {
    return {
      version: "https://jsonfeed.org/version/1.1",
      title: parseAtomNode(channel.find("> title")).text(),
      description: coerceEmptyString(parseAtomNode(channel.find("> subtitle")).text()),
      home_page_url: channel.find(`> link:not([rel="self"])`).attr("href"),
      icon: coerceEmptyString(channel.find("> icon").text()),
      items: [],
    };
  },
  parseItem: (item: Cheerio<Element>, _channel: Cheerio<Element>) => {
    const decodedTitle = parseAtomNode(item.find("> title"));
    const decodedSummary = parseAtomNode(item.find("> summary"));
    const decodedContent = parseAtomNode(item.find("> content"));
    const publishedDate = coerceEmptyString(item.find("> published").text());
    const modifedDate = coerceEmptyString(item.find("> updated").text());

    return {
      id: coerceEmptyString(item.find("> id").text()) ?? item.find("> link").attr("href") ?? "",
      url: item.find("> link").attr("href")?.trim(),
      title: coerceEmptyString(decodedTitle.text()),
      summary: coerceEmptyString(decodedSummary.text()) ?? coerceEmptyString(decodedContent.text()),
      content_html: coerceEmptyString(decodedContent.html()) ?? coerceEmptyString(decodedSummary.html(), ""),
      content_text: coerceEmptyString(decodedContent.text()) ?? coerceEmptyString(decodedSummary.text(), ""),
      image: item.find(`> link[rel="enclosure"][type^="image"]`).attr("href"),
      date_published: coerceError(() => new Date(publishedDate ?? "").toISOString()),
      date_modified: coerceError(() => new Date(modifedDate ?? "").toISOString()),
    };
  },
};

function $hasCdata($: Cheerio<AnyNode>) {
  return $.toArray().some(elementHasCdata);
}

function elementHasCdata(node: AnyNode) {
  return (node as Element)?.children.some((c) => c.type === ElementType.CDATA);
}

function parseAtomNode($: Cheerio<AnyNode>) {
  const type = $.attr("type");
  switch (type) {
    case "html":
      return parseXmlNode($);
    case "xhtml":
      return parseXmlNode($.find("div").first());
    case "text":
    default:
      return {
        html: () => escapeXmlText($.html()?.trim() ?? ""),
        text: () => $.html()?.trim() ?? "",
      };
  }
}

function parseXmlNode($: Cheerio<AnyNode>): ParsedXmlNode {
  const _getHtml = () => ($hasCdata($) ? $.text().trim() : $.html()?.trim() ?? "");
  const _getText = () => cheerio.load(_getHtml()).text();

  return {
    html: _getHtml,
    text: _getText,
  };
}

interface ParsedXmlNode {
  text: () => string;
  html: () => string;
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
