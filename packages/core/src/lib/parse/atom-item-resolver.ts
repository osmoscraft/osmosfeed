import { decode, decodeAtomElement, getNonEmptyString } from "./decode";
import type { XmlResolver } from "./parse-xml-feed";

export const atomItemResolver: XmlResolver = (_upstreamValue, item$) => {
  const description = decodeAtomElement(item$("summary"));
  const content = decodeAtomElement(item$("content"));

  return {
    id: "",
    title: decode(item$("title")).text(),
    url: item$("link").attr("href"),
    summary: getNonEmptyString(description.text, content.text),
    content_text: getNonEmptyString(content.text, description.text),
    content_html: getNonEmptyString(content.html, description.html),
  };
};
