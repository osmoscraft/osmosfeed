import type { XmlParser } from "./parse-xml-feed";
import { atomChannelResolver } from "./atom-channel-resolver.js";
import { atomItemResolver } from "./atom-item-resolver.js";
import { atomItemSelector } from "./atom-item-selector.js";
import { commonChannelResolver } from "./common-channel-resolver.js";

export const atomParser: XmlParser = {
  matcher: (root$) => root$("feed").length > 0,
  channelResolvers: [commonChannelResolver, atomChannelResolver],
  itemResolvers: [atomItemResolver],
  itemSelector: atomItemSelector,
};
