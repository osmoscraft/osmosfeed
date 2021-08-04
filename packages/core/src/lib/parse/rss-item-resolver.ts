import { decode, getNonEmptyString, Resolver } from "../../sdk/sdk.js";

export const rssItemResolver: Resolver = (_upstreamValue, item$) => {
  const description = decode(item$("description"));
  const content = decode(item$("content\\:encoded"));

  return {
    id: "",
    title: decode(item$("title")).text(),
    url: item$("link").text(),
    summary: getNonEmptyString(description.text, content.text),
    content_text: getNonEmptyString(content.text, description.text),
    content_html: getNonEmptyString(content.html, description.html),
  };
};
