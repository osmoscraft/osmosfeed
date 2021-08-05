import type { XmlItemSelector } from "./parse-xml-feed";

export const atomItemSelector: XmlItemSelector = (root$) => [...root$("entry")];
