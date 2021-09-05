import { coerceEmptyString } from "./coerce-empty-string";
import { decode } from "./decode";
import type { XmlResolver } from "./parse-xml-feed";

export const atomChannelResolver: XmlResolver = (_upstreamValue, $) => ({
  title: decode($("feed title").first()).text(),
  home_page_url: $("feed link").first().attr("href"),
  feed_url: "", // TBD
	icon: coerceEmptyString($("feed icon").text(), undefined),
});
