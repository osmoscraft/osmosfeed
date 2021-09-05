import { decode, getNonEmptyString } from "./decode";
import type { XmlResolver } from "./parse-xml-feed";

export const rssItemResolver: XmlResolver = (_upstreamValue, item$) => {
  const description = decode(item$("description"));
  const content = decode(item$("content\\:encoded"));

  return {
    id: "",
    title: decode(item$("title")).text(),
    url: item$("link").text(),
    summary: getNonEmptyString(description.text, content.text),
    content_text: getNonEmptyString(content.text, description.text),
    content_html: getNonEmptyString(content.html, description.html),
    image:
      item$(`enclosure[type^="image"]`).attr("url") ??
      item$(`enc\\:enclosre[enc\\:type^="image"]`).attr("rdf:resource") ??
      undefined,
  };
};
