import type { XmlParser } from "./parse-xml-feed";
import { atomChannelResolver } from "./atom-channel-resolver";
import { atomItemResolver } from "./atom-item-resolver";
import { atomItemSelector } from "./atom-item-selector";
import { commonChannelResolver } from "./common-channel-resolver";

export const atomParser: XmlParser = {
  matcher: (root$) => root$("feed").length > 0,
  channelResolvers: [commonChannelResolver, atomChannelResolver],
  itemResolvers: [atomItemResolver],
  itemSelector: atomItemSelector,
};
