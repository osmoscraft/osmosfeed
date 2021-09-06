import { coerceEmptyString } from "./coerce-empty-string";
import { coerceError } from "./coerce-error";
import { decode } from "./decode";
import type { XmlResolver } from "./parse-xml-feed";

export const atomChannelResolver: XmlResolver = (_upstreamValue, $) => {
  const dateUpdated = $(`feed updated`).text();

  const extensions = dateUpdated
    ? {
        date_modified: dateUpdated ? coerceError(() => new Date(dateUpdated).toISOString(), undefined) : undefined,
      }
    : undefined;

  return {
    title: decode($("feed title").first()).text(),
    home_page_url: $("feed link").first().attr("href"),
    feed_url: "", // TBD
    icon: coerceEmptyString($("feed icon").text(), undefined),
    _ext: extensions,
  };
};
