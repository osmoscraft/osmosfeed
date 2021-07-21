import cheerio, { Document } from "cheerio";
import { AbstractJsonFeedConverter, RssToJsonFeedConverter } from "./json-feed-converters.js";

export class UnknownFeedTypeError extends Error {}
export function getConverter(root: Document): AbstractJsonFeedConverter {
  const cheerioDom = cheerio.load(root, { xmlMode: true, decodeEntities: false, recognizeCDATA: true });
  if (!cheerioDom("rss").length) throw new UnknownFeedTypeError();

  return new RssToJsonFeedConverter(cheerioDom);
}
