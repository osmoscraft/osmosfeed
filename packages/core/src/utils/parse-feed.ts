import cheerio from "cheerio";
import htmlparser2 from "htmlparser2";
import { rssToJsonFeed } from "./feed-converters.js";

export class UnknownFeedTypeError extends Error {}

export function xmlToJsonFeed(input: string) {
  const dom = htmlparser2.parseDocument(input, { xmlMode: true, decodeEntities: true });

  const cheerioDom = cheerio.load(dom, { xmlMode: true, decodeEntities: false });

  if (cheerioDom("rss").length) {
    return rssToJsonFeed(cheerioDom);
  } else {
    throw new UnknownFeedTypeError();
  }
}
