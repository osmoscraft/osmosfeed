import type { Document, Element, Node } from "cheerio";
import cheerio, { Cheerio } from "cheerio";
import * as htmlparser2 from "htmlparser2";
import { ElementType } from "htmlparser2";
import type { JsonFeed, JsonFeedChannel, JsonFeedItem } from "./json-feed";

export interface XmlFeedParser {
  isMatch: (root: Cheerio<Document>) => boolean;
  selectChannel: (root: Cheerio<Document>) => Cheerio<Element>;
  resolveChannel: (node: Cheerio<Element>) => JsonFeedChannel;
  selectItems: (root: Cheerio<Document>) => Cheerio<Element>;
  resolveItem: (node: Cheerio<Element>, channel: Cheerio<Element>) => JsonFeedItem;
}

export const rssParser: XmlFeedParser = {
  isMatch: (root) => root.find("channel").length > 0,
  selectChannel: selectRssChannel,
  resolveChannel: resolveRssChannel,
  selectItems: selectRssItems,
  resolveItem: resolveRssItem,
};

export const atomParser: XmlFeedParser = {
  isMatch: (root) => root.find("feed").length > 0,
  selectChannel: selectAtomChannel,
  resolveChannel: resolveAtomChannel,
  selectItems: selectAtomItems,
  resolveItem: resolveAtomItem,
};

export interface ParseFeedInput {
  xml: string;
  parsers: XmlFeedParser[];
}
export function parseFeed(input: ParseFeedInput): JsonFeed {
  const dom = htmlparser2.parseDocument(input.xml, { xmlMode: true, decodeEntities: true });
  const $ = cheerio.load(dom, { xmlMode: true, decodeEntities: false });
  const root = $.root();

  const parser = input.parsers.find((parser) => parser.isMatch(root));
  if (!parser) throw new Error("No parser found");

  const { selectChannel, resolveChannel, selectItems, resolveItem } = parser;

  const channelElement = selectChannel(root);
  const itemElements = selectItems(root)
    .toArray()
    .map((itemElement) => $(itemElement));

  return {
    ...resolveChannel(channelElement),
    items: itemElements.map((itemElement) => resolveItem(itemElement, channelElement)),
  };
}

function selectAtomChannel(root: Cheerio<Node>): Cheerio<Element> {
  return root.find("feed");
}

function selectRssChannel(root: Cheerio<Node>): Cheerio<Element> {
  return root.find("channel");
}

function selectAtomItems(root: Cheerio<Node>): Cheerio<Element> {
  return root.find("entry");
}

function selectRssItems(root: Cheerio<Node>): Cheerio<Element> {
  return root.find("item");
}

function resolveRssChannel(channel: Cheerio<Element>): JsonFeedChannel {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: decodeXmlText(channel.find("title")).text(),
    description: decodeXmlText(channel.find("description")).text(),
    home_page_url: coerceEmptyString(channel.find("link").text()),
  };
}

function resolveAtomChannel(channel: Cheerio<Element>): JsonFeedChannel {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: decodeAtomText(channel.find("title")).text(),
    description: decodeAtomText(channel.find("subtitle")).text(),
    home_page_url: channel.find("link").attr("href"),
  };
}

function resolveRssItem(item: Cheerio<Element>, _channel: Cheerio<Element>): JsonFeedItem {
  const decodedTitle = decodeXmlText(item.find("title"));
  const decodedSummary = decodeXmlText(item.find("description"));
  const decodedContent = decodeXmlText(item.find("content\\:encoded"));

  return {
    id: "", // TODO
    title: decodedTitle.text(),
    summary: coerceEmptyString(decodedSummary.text()) ?? coerceEmptyString(decodedContent.text()),
    content_html: coerceEmptyString(decodedContent.html()) ?? coerceEmptyString(decodedSummary.html()),
    content_text: coerceEmptyString(decodedContent.text()) ?? coerceEmptyString(decodedSummary.text()),
  };
}

function resolveAtomItem(item: Cheerio<Element>, _channel: Cheerio<Element>): JsonFeedItem {
  const decodedTitle = decodeAtomText(item.find("title"));
  const decodedSummary = decodeAtomText(item.find("summary"));
  const decodedContent = decodeAtomText(item.find("content"));

  return {
    id: "", // TODO
    title: decodedTitle.text(),
    summary: coerceEmptyString(decodedSummary.text()) ?? coerceEmptyString(decodedContent.text()),
    content_html: coerceEmptyString(decodedContent.html()) ?? coerceEmptyString(decodedSummary.html()),
    content_text: coerceEmptyString(decodedContent.text()) ?? coerceEmptyString(decodedSummary.text()),
  };
}

function coerceEmptyString(maybeEmptyString: string, coerceTo = undefined) {
  if (!maybeEmptyString) return coerceTo;
  return maybeEmptyString;
}

function $hasCdata($: Cheerio<Node>) {
  return $.toArray().some(elementHasCdata);
}

function elementHasCdata(node: Node) {
  return (node as Element)?.children.some((c) => c.type === ElementType.CDATA);
}

export function decodeAtomText($: Cheerio<Node>) {
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

export function decodeXmlText($: Cheerio<Node>): { html: () => string; text: () => string } {
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
