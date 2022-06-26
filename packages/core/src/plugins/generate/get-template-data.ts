import { pkg } from "../../utils/pkg";
import { getDateFromIsoString, getIsoTimeWithOffset } from "../../utils/time";
import { ATOM_FILENAME } from "../generate";
import type { JsonFeed, JsonFeedItem, Project } from "../types";

export interface TemplateData {
  /** Array of dates, each containing the content published on the date */
  dates: DateView[];
  /** Array of feeds, each containing the content published from the source */
  feeds: FeedView[];
  /** Array of items, most recent first */
  items: ItemView[];

  /** npm package version of the engine */
  engineVersion: string;
  /** URL for the generated atom feed */
  feedHref: string;
  /** URL for the osmosfeed project */
  fossProjectUrl: string;
  /** ISO timestamp for the build */
  sitePublishTime: string;

  /** URL to the GitHub Action run. Available only when using GitHub Action */
  githubRunUrl: string | null;
  /** URL to the html home page of the generated site */
  githubPageUrl: string;

  /** A hash string that changes when any file in the static dir changes */
  staticDirHash: string;

  siteTitle: string;
}

interface ItemView extends JsonFeedItem {
  feed: JsonFeed;
}

interface FeedView extends TemplateFeedBase {
  dates: {
    isoUtcPublishTime: string;
    isoOffsetPublishDate: string;
    items: ItemView[];
  }[];
}

interface DateView {
  isoUtcPublishTime: string;
  isoOffsetPublishDate: string;
  items: ItemView[];
  feeds: TemplateFeedBase[];
}

interface TemplateFeedBase extends JsonFeed {
  items: ItemView[];
}

export function getTemplateData(project: Project, staticDirHash: string): TemplateData {
  const { githubServerUrl, githubRepository, githubRunId, githubPageUrl, siteTitle } = project;

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
      return organizeByItems(project);
    },

    engineVersion: pkg.version,
    githubRunUrl,
    githubPageUrl: githubPageUrl,
    siteTitle: siteTitle,
    sitePublishTime: new Date().toISOString(),
    fossProjectUrl: `https://github.com/osmoscraft/osmosfeed`,
    feedHref: ATOM_FILENAME,
    staticDirHash,
  };
}

function getTimestamps(isoUtcTimestamp: string, timezoneOffset: number) {
  const isoOffsetTime = getIsoTimeWithOffset(isoUtcTimestamp, timezoneOffset);
  return {
    isoUtcPublishTime: isoUtcTimestamp,
    isoOffsetPublishDate: getDateFromIsoString(isoOffsetTime),
  };
}

function organizeByItems(project: Project): ItemView[] {
  const items: ItemView[] = project.feeds
    .flatMap((feed) =>
      feed.items.map((item) => ({
        ...item,
        feed,
        isoPublishDate: getDateFromIsoString(item.date_published!),
        ...getTimestamps(item.date_published!, project.timezoneOffset),
        title: ensureDisplayString(item.title, "Untitled"),
        description: ensureDisplayString(item.description, "No content preview"),
        readingTimeInMin: Math.round((item.wordCount ?? 0) / 300),
      }))
    )
    .sort((a, b) => b.date_published!.localeCompare(a.date_published!)); // by time, most recent first
  return items;
}

function organizeBySources(project: Project): FeedView[] {
  const items = organizeByItems(project);

  const itemsByFeed = groupBy(items, (item) => item.feed);
  const sortedItemsByFeed = [...itemsByFeed.entries()].map(([feed, items]) => ({
    ...feed,
    ...getTimestamps(items[0].isoUtcPublishTime, project.timezoneOffset),
    items: items.sort((a, b) => b.date_published!.localeCompare(a.date_published!)), // by date, most recent first
    dates: [...groupBy(items, (item) => item.isoOffsetPublishDate)]
      .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
      .map(([date, items]) => ({
        isoPublishDate: date,
        ...getTimestamps(items[0].isoUtcPublishTime, project.timezoneOffset),
        items,
      })),
  }));

  return sortedItemsByFeed;
}

function organizeByDates(project: Project): DateView[] {
  const items = organizeByItems(project);

  const itemsByDate = groupBy(items, (item) => item.isoOffsetPublishDate);
  const sortedItemsByDate = [...itemsByDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // by date, most recent first
    .map(([date, items]) => ({
      isoPublishDate: date,
      ...getTimestamps(items[0].isoUtcPublishTime, project.timezoneOffset),
      items,
      feeds: [...groupBy(items, (articles) => articles.feed).entries()]
        .sort((a, b) => b[1][0].isoUtcPublishTime.localeCompare(a[1][0].isoUtcPublishTime)) // by date, most recent first
        .map(([feed, items]) => ({
          ...feed,
          ...getTimestamps(items[0].isoUtcPublishTime, project.timezoneOffset),
          items,
        })),
    }));

  return sortedItemsByDate;
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
