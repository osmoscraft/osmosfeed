import { decode } from "./decode";
import type { XmlResolver } from "./parse-xml-feed";

export const rssChannelResolver: XmlResolver = (_upstreamValue, $) => ({
  title: decode($("channel title").first()).text(),
  home_page_url: $("channel link").first().text(),
  feed_url: "", // TBD
});
