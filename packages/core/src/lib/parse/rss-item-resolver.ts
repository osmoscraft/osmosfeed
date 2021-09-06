import { coerceEmptyString } from "./coerce-empty-string";
import { coerceError } from "./coerce-error";
import { decode, getNonEmptyString } from "./decode";
import type { XmlResolver } from "./parse-xml-feed";

export const rssItemResolver: XmlResolver = (_upstreamValue, item$) => {
  const description = decode(item$("description"));
  const content = decode(item$("content\\:encoded"));

  const rss2Date = coerceEmptyString(item$(`pubDate`).text(), undefined);
  const rdfDate = coerceEmptyString(item$(`dc\\:date`).text(), undefined);
  const unknownFormatDate = rss2Date ?? rdfDate;

  const isoDate = unknownFormatDate
    ? coerceError(() => new Date(unknownFormatDate).toISOString(), undefined)
    : undefined;

  return {
    id: "",
    title: decode(item$("title")).text(),
    url: item$("link").text(),
    summary: getNonEmptyString(description.text, content.text),
    content_text: getNonEmptyString(content.text, description.text),
    content_html: getNonEmptyString(content.html, description.html),
    image:
      item$(`enclosure[type^="image"]`).attr("url") ??
      item$(`enc\\:enclosre[enc\\:type^="image"]`).attr("rdf:resource") ??
      undefined,
    date_published: isoDate,
  };
};
