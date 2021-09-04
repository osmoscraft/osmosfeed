import cheerio from "cheerio";
import type { BasicAcceptedElems, CheerioAPI, Element, Node } from "cheerio";
import * as htmlparser2 from "htmlparser2";

export interface XmlResolver {
  (upstreamValue: Record<string, any>, current$: CheerioAPI, root$: CheerioAPI): Record<string, any>;
}

export interface XmlItemSelector {
  (root$: CheerioAPI): Element[];
}

export class MatchingParserNotFoundError extends Error {}

export interface ParseFeedInput {
  rawString: string;
  xmlParsers: XmlParser[];
}

export interface XmlParser {
  matcher: (root$: CheerioAPI) => boolean;
  channelResolvers: XmlResolver[];
  itemResolvers: XmlResolver[];
  itemSelector: ItemSelector;
}

export function parseXmlFeed(input: ParseFeedInput) {
  const dom = htmlparser2.parseDocument(input.rawString, { xmlMode: true, decodeEntities: true });
  const root$ = cheerio.load(dom, { xmlMode: true, decodeEntities: false });

  for (let parser of input.xmlParsers) {
    if (parser.matcher(root$)) {
      return convertToJsonFeed({
        root$: root$,
        channelResolvers: parser.channelResolvers,
        itemResolvers: parser.itemResolvers,
        itemSelector: parser.itemSelector,
      });
    }
  }

  throw new MatchingParserNotFoundError();
}

export interface JsonFeed {
  version: string;
  title: string;
  home_page_url?: string;
  feed_url?: string;
  items: JsonFeedItem[];
}

export interface JsonFeedItem {
  id: string;
  url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  summary?: string;
}

export interface ConvertToJsonFeedInput {
  root$: CheerioAPI;
  channelResolvers: XmlResolver[];
  itemResolvers: XmlResolver[];
  itemSelector: ItemSelector;
}

export interface ItemSelector {
  (root$: CheerioAPI): Element[];
}

function convertToJsonFeed({
  root$,
  channelResolvers,
  itemSelector: itemsSelector,
  itemResolvers,
}: ConvertToJsonFeedInput) {
  return {
    ...applyResolvers(channelResolvers, root$, root$),

    items: itemsSelector(root$)
      .map((element) => withContext(root$, element))
      .map((item$) => ({
        ...applyResolvers(itemResolvers, item$, root$),
      })),
  } as JsonFeed;
}

function withContext($: CheerioAPI, context: BasicAcceptedElems<Node>) {
  const fnWithContext = (...args: Parameters<CheerioAPI>) => {
    if (!args[1]) {
      args[1] = context;
    }

    return $(...args);
  };

  return fnWithContext as CheerioAPI;
}

function applyResolvers(resolverChain: XmlResolver[], current$: CheerioAPI, root$: CheerioAPI) {
  const channelObject = resolverChain.reduce(
    (result, resolver) => ({ ...result, ...resolver(result, current$, root$) }),
    {} as Record<string, any>
  );
  return channelObject;
}
