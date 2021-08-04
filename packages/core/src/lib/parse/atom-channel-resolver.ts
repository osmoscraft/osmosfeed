import { decode, Resolver } from "../../sdk/sdk.js";

export const atomChannelResolver: Resolver = (_upstreamValue, $) => ({
  title: decode($("feed title").first()).text(),
  home_page_url: $("feed link").first().attr("href"),
  feed_url: "", // TBD
});
