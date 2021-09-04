import type { XmlParser } from "./parse-xml-feed";
import { commonChannelResolver } from "./common-channel-resolver";
import { rssChannelResolver } from "./rss-channel-resolver";
import { rssItemResolver } from "./rss-item-resolver";
import { rssItemSelector } from "./rss-item-selector";

export const rssParser: XmlParser = {
  matcher: (root$) => root$("rss").length > 0 || root$("rdf\\:RDF").length > 0,
  channelResolvers: [commonChannelResolver, rssChannelResolver],
  itemResolvers: [rssItemResolver],
  itemSelector: rssItemSelector,
};
