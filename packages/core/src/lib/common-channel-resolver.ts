import { Resolver } from "../sdk/sdk.js";

export const commonChannelResolver: Resolver = (_upstreamValue, $) => ({
  version: "https://jsonfeed.org/version/1.1",
});
