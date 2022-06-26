import { pkg } from "../../utils/pkg";
import { getDateFromIsoString, getIsoTimeWithOffset } from "../../utils/time";
import { FEED_FILENAME } from "../generate";
import type { NormalizeFeedExt, NormalizeItemExt } from "../normalize";
import type { JsonFeed, JsonFeedItem, Project } from "../types";

export interface GetTemplateDataOutput {
  /** Array of dates, each containing the content published on the date */
  dates: TemplateDates[];
  /** Array of source, each containing the content published from the source */
  feeds: TemplateFeed[];
  /** Array of articles, most recent first */
  items: TemplateItem[];

  /** npm package version of the builder */
  cliVersion: string;
  /** URL for the generated atom feed */
  feedHref: string;
  /** URL for the osmosfeed project */
  projectUrl: string;
  /** ISO timestamp for the build */
  siteBuildTimestamp: string;

  /** URL to the GitHub Action run. Available only when using GitHub Action */
  githubRunUrl: string | null;

  siteTitle: string;
}

interface TemplateItem extends NormalizedItem {
  feed: NormalizedFeed;
}

type NormalizedFeed = JsonFeed & NormalizeFeedExt;
type NormalizedItem = JsonFeedItem & NormalizeItemExt;

interface TemplateFeed extends TemplateFeedBase {
  dates: {
    isoUtcPublishTime: string;
    isoOffsetPublishDate: string;
    items: TemplateItem[];
  }[];
}

interface TemplateDates {
  isoUtcPublishTime: string;
  isoOffsetPublishDate: string;
  items: TemplateItem[];
  feeds: TemplateFeedBase[];
}

interface TemplateFeedBase extends NormalizedFeed {
  items: TemplateItem[];
}

interface NormalizedProject extends Project {
  feeds: NormalizedFeed[];
}

export function getTemplateData(project: NormalizedProject): GetTemplateDataOutput {
  const { githubServerUrl, githubRepository, githubRunId } = project;

  const githubRunUrl =
    githubServerUrl && githubRepository && githubRunId
      ? `${project.githubServerUrl}/${project.githubRepository}/actions/runs/${project.githubRunId}`
      : null;

  return {
    get dates() {
      return organizeByDates(project);
    },

    get feeds() {
      return organizeBySources(project);
    },

    get items() {
      return organizeByArticles(project);
    },

    cliVersion: pkg.version,
    githubRunUrl,
    siteTitle: project.siteTitle,
    siteBuildTimestamp: new Date().toISOString(),
    projectUrl: `https://github.com/osmoscraft/osmosfeed`,
    feedHref: FEED_FILENAME,
  };
}

function getTimestamps(isoUtcTimestamp: string, timezoneOffset: number) {
  const isoOffsetTime = getIsoTimeWithOffset(isoUtcTimestamp, timezoneOffset);
  return {
    isoUtcPublishTime: isoUtcTimestamp,
    isoOffsetPublishDate: getDateFromIsoString(isoOffsetTime),
  };
}

function organizeByArticles(project: NormalizedProject): TemplateItem[] {
  const items: TemplateItem[] = project.feeds
    .flatMap((feed) =>
      feed.items.map((item) => ({
        ...item,
        source: feed,
        isoPublishDate: getDateFromIsoString(item.date_published!),
        ...getTimestamps(item.publishedOn, project.timezoneOffset),
        title: ensureDisplayString(item.title, "Untitled"),
        description: ensureDisplayString(item.description, "No content preview"),
        readingTimeInMin: Math.round((item.wordCount ?? 0) / 300),
      }))
    )
    .sort((a, b) => b.date_published!.localeCompare(a.date_published!)); // by time, most recent first
  return items;
}

function organizeBySources(input: GetTemplateDataInput): TemplateFeed[] {
  const articles = organizeByArticles(input);

  const articlesBySource = groupBy(articles, (article) => article.feed);
  const sortedArticlesBySource = [...articlesBySource.entries()].map(([source, articles]) => ({
    ...source,
    ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
    articles: articles.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)), // by date, most recent first
    dates: [...groupBy(articles, (article) => article.isoOffsetPublishDate)]
      .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
      .map(([date, articles]) => ({
        isoPublishDate: date,
        ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
        articles,
      })),
  }));

  return sortedArticlesBySource;
}

function organizeByDates(input: GetTemplateDataInput): TemplateDates[] {
  const articles = organizeByArticles(input);

  const articlesByDate = groupBy(articles, (article) => article.isoOffsetPublishDate);
  const sortedArticlesByDate = [...articlesByDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
    .map(([date, articles]) => ({
      isoPublishDate: date,
      ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
      articles,
      sources: [...groupBy(articles, (articles) => articles.feed).entries()]
        .sort((a, b) => b[1][0].isoUtcPublishTime.localeCompare(a[1][0].isoUtcPublishTime)) // by date, most recent first
        .map(([source, articles]) => ({
          ...source,
          ...getTimestamps(articles[0].isoUtcPublishTime, input.config.timezoneOffset),
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
