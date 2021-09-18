import type { Document, Element } from "cheerio";
import cheerio, { Cheerio } from "cheerio";
import * as htmlparser2 from "htmlparser2";
import type { JsonFeed, JsonFeedChannel, JsonFeedItem } from "../json-feed";

export interface XmlFeedParser {
  isMatch: (root: Cheerio<Document>) => boolean;
  selectChannel: (root: Cheerio<Document>) => Cheerio<Element>;
  resolveChannel: (channelElement: Cheerio<Element>) => JsonFeedChannel;
  selectItems: (root: Cheerio<Document>) => Cheerio<Element>;
  resolveItem: (itemElement: Cheerio<Element>, channelElement: Cheerio<Element>) => JsonFeedItem;
}

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

  return {
    ...resolveChannel(channelElement),
    items: selectItems(root)
      .toArray()
      .map((itemElement) => resolveItem($(itemElement), channelElement)),
  };
}
