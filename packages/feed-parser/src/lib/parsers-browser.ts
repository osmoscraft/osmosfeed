import { JsonFeed, JsonFeedItem } from "@osmosfeed/types";

//
// This is a reference implementation of feed parser, using only browser APIs
// This is not currently in use but it is likely a good solution for client side feed refresh
//

export interface XmlFeedParser {
  isMatch: (root: Document) => boolean;
  selectChannel: (root: Document) => Element;
  resolveChannel: (channelElement: Element) => Omit<JsonFeed, "items">;
  selectItems: (root: Document) => HTMLCollection;
  resolveItem: (itemElement: Element, channelElement: Element) => JsonFeedItem;
}

export const rssParser: XmlFeedParser = {
  isMatch: (root) => ["rss", "rdf:RDF"].includes(root.children?.[0]?.tagName),
  selectChannel: (root) => root.getElementsByTagName("channel")[0],
  selectItems: (root) => root.getElementsByTagName("item"),
  resolveChannel: (channel) => {
    const publishDate =
      channel.getElementsByTagName("pubDate")[0]?.textContent ??
      channel.getElementsByTagName("dc:date")[0]?.textContent;
    const modifiedhDate =
      channel.getElementsByTagName("lastBuildDate")[0]?.textContent ??
      channel.getElementsByTagName("dc:date")[0]?.textContent;
    const channelChildren = [...channel.children];

    return {
      version: "https://jsonfeed.org/version/1.1",
      title: parseChildByTagName(channel, "title")?.text() ?? "",
      description: parseChildByTagName(channel, "description")?.text(),
      home_page_url: channelChildren.find((node) => node.tagName === "link")?.textContent ?? undefined,
      icon:
        channel.querySelector(":scope > image url")?.textContent ??
        channel.getElementsByTagName("image")[0]?.getAttribute("rdf:resource") ??
        undefined,
      _date_published: coerceError(() => new Date(publishDate ?? modifiedhDate ?? "").toISOString()),
      _date_modified: coerceError(() => new Date(modifiedhDate ?? publishDate ?? "").toISOString()),
    };
  },
  resolveItem: (item, _channel) => {
    const itemChildren = [...item.children];

    const decodedTitle = parseChildByTagName(item, "title")?.text();
    const summaryNode = parseChildByTagName(item, "description");
    const contentNode = parseChildByTagName(item, "content:encoded");
    const date = itemChildren.find((node) => ["pubDate", "dc:date"].includes(node.tagName))?.textContent ?? "";

    return {
      id:
        itemChildren.find((node) => node.tagName === "guid")?.textContent ??
        itemChildren.find((node) => node.tagName === "link")?.textContent ??
        "",
      url: itemChildren.find((node) => node.tagName === "link")?.textContent ?? undefined,
      title: decodedTitle,
      summary: summaryNode?.text() ?? contentNode?.text() ?? undefined,
      content_html: (contentNode?.html() ?? summaryNode?.html() ?? "").trim(),
      content_text: (contentNode?.text() ?? summaryNode?.text() ?? "").trim(),
      image:
        item.querySelector(`enclosure[type^="image"]`)?.getAttribute("url") ??
        itemChildren
          .filter(
            (child) => child.tagName === "enc:enclosure" && child.getAttribute("enc:type")?.startsWith("image") // TODO this case is missing test
          )[0]
          ?.getAttribute("rdf:resource") ??
        undefined,
      date_published: coerceError(() => new Date(date ?? "").toISOString()),
      date_modified: coerceError(() => new Date(date ?? "").toISOString()),
    };
  },
};

export const atomParser: XmlFeedParser = {
  isMatch: (root) => root.children?.[0]?.tagName === "feed",
  selectChannel: (root) => root.getElementsByTagName("feed")[0],
  selectItems: (root) => root.getElementsByTagName("entry"),
  resolveChannel: (channel) => {
    const channelChildren = [...channel.children];
    const date = channelChildren.find((node) => node.tagName === "updated")?.textContent ?? undefined;
    const homeUrl =
      channelChildren
        .find((node) => node.tagName === "link" && node.getAttribute("rel") !== "self")
        ?.getAttribute("href") ?? undefined;

    return {
      version: "https://jsonfeed.org/version/1.1",
      title: channelChildren.find((node) => node.tagName === "title")?.textContent ?? "",
      description: channelChildren.find((node) => node.tagName === "subtitle")?.textContent ?? undefined,
      home_page_url: homeUrl,
      icon: channelChildren.find((node) => node.tagName === "icon")?.textContent ?? undefined,
      _date_published: date ? coerceError(() => new Date(date).toISOString()) : undefined,
      _date_modified: date ? coerceError(() => new Date(date).toISOString()) : undefined,
    };
  },
  resolveItem: (item, _channel) => {
    const itemChildren = [...item.children];
    const decodedTitle = itemChildren.find((node) => node.tagName === "title")?.textContent;
    const summaryNode = parseAtomChildByTagName(item, "summary");
    const contentNode = parseAtomChildByTagName(item, "content");
    const publishedDate = itemChildren.find((node) => node.tagName === "published")?.textContent;
    const modifedDate = itemChildren.find((node) => node.tagName === "updated")?.textContent;

    return {
      id:
        itemChildren.find((node) => node.tagName === "id")?.textContent ??
        itemChildren.find((node) => node.tagName === "link")?.getAttribute("href") ??
        "",
      url: itemChildren.find((node) => node.tagName === "link")?.getAttribute("href") ?? undefined,
      title: decodedTitle ?? undefined,
      summary: summaryNode?.text() ?? contentNode?.text() ?? undefined,
      content_html: contentNode?.html() ?? summaryNode?.html() ?? "",
      content_text: contentNode?.text() ?? summaryNode?.text() ?? "",
      image: item.querySelector(`:scope > link[rel="enclosure"][type^="image"]`)?.getAttribute("href") ?? undefined,
      date_published: coerceError(() => new Date(publishedDate ?? modifedDate ?? "").toISOString()),
      date_modified: coerceError(() => new Date(modifedDate ?? publishedDate ?? "").toISOString()),
    };
  },
};

function coerceError<T>(fn: () => T, coerceTo = undefined) {
  try {
    return fn();
  } catch {
    return coerceTo;
  }
}

function parseAtomChildByTagName(node: Element, tagName: string): ParsedXmlNode | undefined {
  return safeCall(
    parseAtomNode,
    [...node.children].find((node) => node.tagName === tagName)
  );
}

function parseChildByTagName(node: Element, tagName: string): ParsedXmlNode | undefined {
  return safeCall(
    parseXmlNode,
    [...node.children].find((node) => node.tagName === tagName)
  );
}

function safeCall<T, K, P = undefined>(
  fn: (value: T) => K,
  maybeValue: T | null | undefined,
  fallbackValue?: P
): K | P {
  if (maybeValue === null || maybeValue === undefined) {
    return fallbackValue as P;
  } else {
    return fn(maybeValue);
  }
}

function parseAtomNode(node: Element): ParsedXmlNode {
  const type = node.getAttribute("type");

  switch (type) {
    case "html":
      return parseXmlNode(node);
    case "xhtml":
      const xhtmlRoot = [...node.children].find(
        (node) => node.tagName === "div" && node.getAttribute("xmlns") === "http://www.w3.org/1999/xhtml"
      );
      return {
        html: () => xhtmlRoot?.innerHTML?.trim() ?? "",
        text: () => xhtmlRoot?.textContent?.trim() ?? "",
      };
    case "text":
    default:
      return {
        html: () => node.innerHTML ?? "",
        text: () => unescapeString(node.innerHTML.trim()) ?? "",
      };
  }
}

function parseXmlNode(node: Element): ParsedXmlNode {
  const text = () => xmlNodeToText(node);
  const html = () => xmlNodeToHtml(node);

  return {
    text,
    html,
  };
}

interface ParsedXmlNode {
  text: () => string;
  html: () => string;
}

function xmlNodeToHtml(node: Element) {
  if ([...node.childNodes].some((node) => node instanceof CDATASection)) {
    return node.textContent?.trim() ?? "";
  } else {
    return unescapeString(node.innerHTML.trim());
  }
}

function unescapeString(escapedString: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = escapedString;
  return textarea.value;
}

function xmlNodeToText(node: Element) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(node.textContent?.trim() ?? "", "text/html");
  return dom.body.textContent ?? "";
}
