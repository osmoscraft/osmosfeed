import type { XmlItemSelector } from "./parse-xml-feed";

export const rssItemSelector: XmlItemSelector = (root$) => [...root$("item")];
