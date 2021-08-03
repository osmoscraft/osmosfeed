import cheerio, { Cheerio, CheerioAPI, Element, Node } from "cheerio";
import { ElementType } from "htmlparser2";

export interface Resolver {
  (upstreamValue: Record<string, any>, current$: CheerioAPI, root$: CheerioAPI): Record<string, any>;
}

export interface ItemSelector {
  (root$: CheerioAPI): Element[];
}

export function getNonEmptyString(...stringGetters: (() => string)[]) {
  for (let fn of stringGetters) {
    const value = fn();
    if (value) return value;
  }

  return "";
}

function $hasCdata($: Cheerio<Node>) {
  return $.toArray().some(elementHasCdata);
}

function elementHasCdata(node: Node) {
  return (node as Element)?.children.some((c) => c.type === ElementType.CDATA);
}

export function decodeAtomElement($: Cheerio<Node>) {
  const type = $.attr("type");
  switch (type) {
    case "html":
      return decode($);
    case "xhtml":
      return decode($);
    case "text":
    default:
      return {
        html: () => $.html()?.trim() ?? "",
        text: () => $.text()?.trim(),
      };
  }
}

export function decode($: Cheerio<Node>): { html: () => string; text: () => string } {
  const _getHtml = () => ($hasCdata($) ? $.text().trim() : $.html()?.trim() ?? "");
  const _getText = () => cheerio.load(_getHtml()).text();

  return {
    html: _getHtml,
    text: _getText,
  };
}
