import type { XmlParser } from "./parse-xml-feed";
import { commonChannelResolver } from "./common-channel-resolver.js";
import { rssChannelResolver } from "./rss-channel-resolver.js";
import { rssItemResolver } from "./rss-item-resolver.js";
import { rssItemSelector } from "./rss-item-selector.js";

export const rssParser: XmlParser = {
  matcher: (root$) => root$("rss").length > 0 || root$("rdf\\:RDF").length > 0,
  channelResolvers: [commonChannelResolver, rssChannelResolver],
  itemResolvers: [rssItemResolver],
  itemSelector: rssItemSelector,
};
