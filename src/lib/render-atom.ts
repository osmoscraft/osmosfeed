import { Feed } from "feed";
import { cliVersion } from "../utils/version";
import { CACHE_FILENAME } from "./cache";
import type { Config } from "./get-config";
import type { EnrichedArticle, EnrichedSource } from "./enrich";
import { getHostnameFromUrl } from "../utils/get-hostname-from-url";

export const FEED_FILENAME = "feed.atom";
export const INDEX_FILENAME = "index.html";

export interface RenderAtomInput {
  enrichedSources: EnrichedSource[];
  config: Config;
}

interface EnrichedArticleWithSource extends EnrichedArticle {
  source: EnrichedSource;
}

export function renderAtom({ enrichedSources, config }: RenderAtomInput): string {
  const articles: EnrichedArticleWithSource[] = enrichedSources
    .map((enrichedSource) =>
      enrichedSource.articles.map((article) => ({
        ...article,
        source: enrichedSource,
      }))
    )
    .flat()
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));

  const nowTimestamp = new Date().toISOString();
  const siteUrl = config.cacheUrl?.replace(CACHE_FILENAME, INDEX_FILENAME);
  const feedUrl = config.cacheUrl?.replace(CACHE_FILENAME, FEED_FILENAME);
  const feedId = siteUrl ?? `urn:${nowTimestamp}`; // cacheUrl is required. Fallback value for testing only.
  const feedLinks = feedUrl ? { atom: feedUrl } : undefined;

  const feed = new Feed({
    title: config.siteTitle,
    updated: new Date(),
    id: feedId,
    generator: `osmosfeed ${cliVersion}`,
    link: siteUrl ?? INDEX_FILENAME,
    feedLinks,
    description: "",
    copyright: "",
  });

  articles.forEach((article) => {
    feed.addItem({
      title: article.title,
      id: article.id,
      description: article.description,
      link: article.link,
      author: [
        {
          name:
            article.author ??
            article.source.title ??
            getHostnameFromUrl(article.link) ??
            getHostnameFromUrl(article.source.siteUrl) ??
            getHostnameFromUrl(article.source.feedUrl) ??
            "Unknown author",
        },
      ],
      date: new Date(article.publishedOn),
    });
  });

  const atomXml = feed.atom1();

  return atomXml;
}
