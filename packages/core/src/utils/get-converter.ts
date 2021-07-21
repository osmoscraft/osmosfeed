import cheerio, { Document } from "cheerio";
import { AbstractJsonFeedConverter, RssToJsonFeedConverter } from "./json-feed-converters.js";

export class UnknownFeedTypeError extends Error {}
export function getConverter(root: Document): AbstractJsonFeedConverter {
  // TODO adjust config
  const cheerioDom = cheerio.load(root, { xmlMode: true, decodeEntities: false });
  if (!cheerioDom("rss").length) throw new UnknownFeedTypeError();

  return new RssToJsonFeedConverter(cheerioDom);
}
