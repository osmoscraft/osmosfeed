import assert from "assert/strict";
import { Feed } from "feed";
import { pkg } from "../../utils/pkg";
import { ATOM_FILENAME, INDEX_FILENAME } from "../generate";
import type { JsonFeed, JsonFeedItem, Project } from "../types";

interface JsonFeedItemWithParent extends JsonFeedItem {
  parent: JsonFeed;
}

export function getAtomXml(project: Project): string {
  assert(!!project.githubPageUrl, "githubPageUrl is missing");

  const items: JsonFeedItemWithParent[] = project.feeds
    .map((feed) =>
      feed.items.map((item) => ({
        ...item,
        parent: feed,
      }))
    )
    .flat()
    .sort((a, b) => b.date_published!.localeCompare(a.date_published!));

  const nowTimestamp = new Date().toISOString();
  const siteUrl = project.githubPageUrl;
  const feedUrl = new URL(ATOM_FILENAME, project.githubPageUrl);
  const feedId = siteUrl ?? `urn:${nowTimestamp}`; // cacheUrl is required. Fallback value for testing only.
  const feedLinks = feedUrl ? { atom: feedUrl } : undefined;

  const feed = new Feed({
    title: project.siteTitle,
    updated: new Date(),
    id: feedId,
    generator: `osmosfeed ${pkg.version}`,
    link: siteUrl ?? INDEX_FILENAME,
    feedLinks,
    description: "",
    copyright: "",
  });

  items.forEach((item) => {
    feed.addItem({
      title: item.title ?? "",
      id: item.id,
      description: item.description,
      link: item.link,
      date: new Date(item.publishedOn),
    });
  });

  const atomXml = feed.atom1();

  return atomXml;
}
