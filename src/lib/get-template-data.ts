import { htmlToText } from "../utils/html-to-text";
import { cliVersion } from "../utils/version";
import type { EnrichedArticle, EnrichedSource } from "./enrich";
import type { Config } from "./get-config";
import { FEED_FILENAME } from "./render-atom";

interface TemplateArticle extends EnrichedArticle {
  source: EnrichedSource;
  readingTimeInMin: number;
}

interface TemplateSource extends TemplateSourceBase {
  dates: {
    isoPublishDate: string;
    articles: TemplateArticle[];
  }[];
}

interface TemplateDates {
  isoPublishDate: string;
  articles: TemplateArticle[];
  sources: TemplateSourceBase[];
}

interface TemplateSourceBase extends EnrichedSource {
  articles: TemplateArticle[];
}

export interface GetTemplateDataInput {
  enrichedSources: EnrichedSource[];
  config: Config;
}

export function getTemplateData(input: GetTemplateDataInput) {
  return {
    get dates() {
      return organizeByDates(input.enrichedSources);
    },

    get sources() {
      return organizeBySources(input.enrichedSources);
    },

    get articles() {
      return organizeByArticles(input.enrichedSources);
    },

    cliVersion,
    siteTitle: input.config.siteTitle,
    siteBuildTimestamp: new Date().toISOString(),
    projectUrl: `https://github.com/osmoscraft/osmosfeed`,
    feedHref: FEED_FILENAME,
  };
}

function organizeByArticles(enrichedSources: EnrichedSource[]): TemplateArticle[] {
  const articles: TemplateArticle[] = enrichedSources.flatMap((enrichedSource) =>
    enrichedSource.articles.map((article) => ({
      ...article,
      source: enrichedSource,
      title: ensureDisplayString(htmlToText(article.title), "Untitled"),
      description: ensureDisplayString(htmlToText(article.description), "No content preview"),
      readingTimeInMin: Math.round((article.wordCount ?? 0) / 300),
    }))
  );

  return articles;
}

function organizeBySources(enrichedSources: EnrichedSource[]): TemplateSource[] {
  const articles = organizeByArticles(enrichedSources);

  const articlesBySource = groupBy(articles, (article) => article.source);
  const sortedArticlesBySource = [...articlesBySource.entries()]
    .sort((a, b) => a[0].feedUrl.localeCompare(b[0].feedUrl)) // by feed url, a-z
    .map(([source, articles]) => ({
      ...source,
      articles: articles.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)), // by date, most recent first
      dates: [...groupBy(articles, (article) => article.publishedOn.split("T")[0])]
        .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
        .map(([date, articles]) => ({
          isoPublishDate: date,
          articles,
        })),
    }));

  return sortedArticlesBySource;
}

function organizeByDates(enrichedSources: EnrichedSource[]): TemplateDates[] {
  const articles = organizeByArticles(enrichedSources);

  const articlesByDate = groupBy(articles, (article) => article.publishedOn.split("T")[0]);
  const sortedArticlesByDate = [...articlesByDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
    .map(([date, articles]) => ({
      isoPublishDate: date,
      articles,
      sources: [...groupBy(articles, (articles) => articles.source).entries()]
        .sort((a, b) => a[0].feedUrl.localeCompare(b[0].feedUrl)) // by feed url, a-z
        .map(([source, articles]) => ({
          ...source,
          articles,
        })),
    }));

  return sortedArticlesByDate;
}

function groupBy<T, K>(array: T[], selector: (item: T) => K) {
  const result = new Map<K, T[]>();
  return array.reduce((latest, item) => {
    const feature = selector(item);

    if (!latest.has(feature)) {
      latest.set(feature, [item]);
    } else {
      latest.get(feature)!.push(item);
    }

    return latest;
  }, result);
}

function ensureDisplayString(input: string | null | undefined, fallback: string) {
  return input?.length ? input : fallback;
}
