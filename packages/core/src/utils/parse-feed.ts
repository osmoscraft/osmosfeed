import cheerio from "cheerio";
import htmlparser2 from "htmlparser2";
import { atomToJsonFeed, rdfToJsonFeed, rssToJsonFeed } from "./feed-converters.js";

export class UnknownFeedTypeError extends Error {}

export function parseFeed(input: string) {
  const dom = htmlparser2.parseDocument(input, { xmlMode: true, decodeEntities: true });

  const cheerioDom = cheerio.load(dom, { xmlMode: true, decodeEntities: false });

  if (cheerioDom("rss").length) {
    return rssToJsonFeed(cheerioDom);
  } else if (cheerioDom("rdf\\:RDF").length) {
    return rdfToJsonFeed(cheerioDom);
  } else if (cheerioDom("feed").length) {
    return atomToJsonFeed(cheerioDom);
  } else {
    throw new UnknownFeedTypeError();
  }
}
