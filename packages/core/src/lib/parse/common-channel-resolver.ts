import type { XmlResolver } from "./parse-xml-feed";

export const commonChannelResolver: XmlResolver = (_upstreamValue, $) => ({
  version: "https://jsonfeed.org/version/1.1",
});
