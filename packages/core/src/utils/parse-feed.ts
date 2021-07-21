import cheerio from "cheerio";
import htmlparser2 from "htmlparser2";
import { RssToJsonFeedConverter } from "./json-feed-converters.js";

export class UnknownFeedTypeError extends Error {}

export function xmlToJsonFeed(input: string) {
  const dom = htmlparser2.parseDocument(input, { xmlMode: true, decodeEntities: true });

  const cheerioDom = cheerio.load(dom, { xmlMode: true, decodeEntities: false });

  let converter;

  // TODO refactor into a function
  if (cheerioDom("rss").length) {
    converter = new RssToJsonFeedConverter(cheerioDom);
  } else {
    throw new UnknownFeedTypeError();
  }

  return converter.convert();
}
