import cheerio, { BasicAcceptedElems, CheerioAPI, Element, Node } from "cheerio";
import htmlparser2 from "htmlparser2";
import {
  atomChannelResolver,
  atomItemResolver,
  atomItemSelector,
  commonChannelResolver,
  rssChannelResolver,
  rssItemResolver,
  rssItemSelector,
} from "../lib/index.js";
import { Resolver } from "../sdk/sdk.js";

export class UnknownFeedTypeError extends Error {}

export function parseFeed(input: string) {
  const dom = htmlparser2.parseDocument(input, { xmlMode: true, decodeEntities: true });

  const cheerioDom = cheerio.load(dom, { xmlMode: true, decodeEntities: false });

  if (cheerioDom("rss").length || cheerioDom("rdf\\:RDF").length) {
    return convertToJsonFeed({
      root$: cheerioDom,
      channelResolvers: [commonChannelResolver, rssChannelResolver],
      itemResolvers: [rssItemResolver],
      itemSelector: rssItemSelector,
    });
  } else if (cheerioDom("feed").length) {
    return convertToJsonFeed({
      root$: cheerioDom,
      channelResolvers: [commonChannelResolver, atomChannelResolver],
      itemResolvers: [atomItemResolver],
      itemSelector: atomItemSelector,
    });
  } else {
    throw new UnknownFeedTypeError();
  }
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
  channelResolvers: Resolver[];
  itemResolvers: Resolver[];
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

function applyResolvers(resolverChain: Resolver[], current$: CheerioAPI, root$: CheerioAPI) {
  const channelObject = resolverChain.reduce(
    (result, resolver) => ({ ...result, ...resolver(result, current$, root$) }),
    {} as Record<string, any>
  );
  return channelObject;
}
