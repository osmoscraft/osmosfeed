import assert from "assert";
import type { CheerioAPI, Element, Node, Document } from "cheerio";
import cheerio, { Cheerio } from "cheerio";
import * as htmlparser2 from "htmlparser2";
import type { JsonFeed, JsonFeedChannel, JsonFeedItem } from "./json-feed";

export function parseFeed(input: string): JsonFeed {
  const dom = htmlparser2.parseDocument(input, { xmlMode: true, decodeEntities: true });
  const $ = cheerio.load(dom, { xmlMode: true, decodeEntities: false });
  const root = $.root();

  const channelElement = selectChannel(root);

  const itemElements = selectItems(root)
    .toArray()
    .map((itemElement) => $(itemElement));

  return {
    ...resolveChannelFields(channelElement),
    items: itemElements.map((itemElement) => resolveItemFields(itemElement, channelElement)),
  };
}

function selectChannel(root: Cheerio<Node>): Cheerio<Element> {
  return ensureLength(root.find("channel,feed").first());
}

function selectItems(root: Cheerio<Node>): Cheerio<Element> {
  return root.find("item");
}

function resolveChannelFields(channel: Cheerio<Element>): JsonFeedChannel {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: channel.find("title").text(),
    home_page_url: findNonEmptyString(
      () => channel.find("link").text(),
      () => channel.find("link").attr("href")
    ),
  };
}

function resolveItemFields(items: Cheerio<Element>, channel: Cheerio<Element>): JsonFeedItem {
  return {
    id: "",
  };
}

function ensureLength<T>(maybeNode: Cheerio<T>): Cheerio<T> {
  if (!maybeNode.length) throw new Error(`${maybeNode} must contain as least one node`);

  return maybeNode;
}

function findNonEmptyString(...stringGetters: (() => string | undefined)[]) {
  for (let fn of stringGetters) {
    const value = fn();
    if (value) return value;
  }

  return "";
}
