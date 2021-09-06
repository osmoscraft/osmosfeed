import { coerceEmptyString } from "./coerce-empty-string";
import { coerceError } from "./coerce-error";
import { decode } from "./decode";
import type { XmlResolver } from "./parse-xml-feed";

export const rssChannelResolver: XmlResolver = (_upstreamValue, $) => {
  const rss2PublishDate = coerceEmptyString($(`channel pubDate`).text(), undefined);
  const rss2LastBuildDate = coerceEmptyString($(`channel lastBuildDate`).text(), undefined);
  const rdfPublishDate = coerceEmptyString($(`channel dc\\:date`).text(), undefined);
  const unknownFormatPublishDate = rss2PublishDate ?? rdfPublishDate;

  const isoPublishDate = unknownFormatPublishDate
    ? coerceError(() => new Date(unknownFormatPublishDate).toISOString(), undefined)
    : undefined;

  const isoLastBuildDate = rss2LastBuildDate
    ? coerceError(() => new Date(rss2LastBuildDate).toISOString(), undefined)
    : undefined;

  const extensions =
    isoPublishDate || isoLastBuildDate
      ? {
          date_published: isoPublishDate,
          date_modified: isoLastBuildDate,
        }
      : undefined;

  return {
    title: decode($("channel title").first()).text(),
    home_page_url: $("channel link").first().text(),
    feed_url: "", // TBD
    icon:
      coerceEmptyString($("channel image url").text(), undefined) ??
      $("channel image[rdf\\:resource]").attr("rdf:resource") ??
      undefined,
    _ext: extensions,
  };
};
