import { decode, Resolver } from "../sdk/sdk.js";

export const rssChannelResolver: Resolver = (_upstreamValue, $) => ({
  title: decode($("channel title").first()).text(),
  home_page_url: $("channel link").first().text(),
  feed_url: "", // TBD
});
