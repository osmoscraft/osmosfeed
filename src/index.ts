import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import * as htmlparse2 from "htmlparser2";
import axios from "axios";

interface ParsedItem {
  sourceHref: string;
  sourceTitle: string;
  title: string;
  link: string;
  daysOld: number;
  publishedOn: string;
}

async function run() {
  const sourcesText = fs.readFileSync(path.resolve("sources.yaml"), "utf8");

  /** @type {string[]} */
  const sources = yaml.safeLoad(sourcesText);

  const pagesAsync: ParsedItem[] = sources.map(async (source) => {
    const response = await axios.get(source.href);
    const xmlString = response.data;
    const feed = htmlparse2.parseFeed(xmlString);

    const items = feed.items ?? [];
    const now = Date.now();

    return items.map((item) => {
      const { title, link, pubDate } = item;

      return {
        sourceHref: source.href,
        sourceTitle: feed.title,
        title,
        link,
        daysOld: Math.round((now - pubDate!.getTime()) / 1000 / 60 / 60 / 24),
        publishedOn: pubDate!.toISOString(),
      };
    });
  });

  const posts = (await Promise.all(pagesAsync)).flat();
  const recentPosts = posts.filter((post) => post.daysOld < 14);

  const postsByDates: Record<string, ParsedItem[]> = recentPosts.reduce(
    (groupedPosts, post) => {
      const publishedOnDate = post.publishedOn.split("T")[0];
      groupedPosts[publishedOnDate] = groupedPosts[publishedOnDate] || [];
      groupedPosts[publishedOnDate].push(post);
      return groupedPosts;
    },
    Object.create(null)
  );

  const outputHtml = Object.entries(postsByDates)
    .map(
      ([date, posts]) => `
   <h3>${date}</h3>
   ${posts
     .map(
       (post) => `<article><a href="${post.link}">${post.title}</a></article>`
     )
     .join("\n")}
  `
    )
    .join("\n");

  fs.mkdirSync(path.resolve("dist"), { recursive: true });
  fs.writeFileSync(path.resolve("dist/index.html"), outputHtml);
}

run();
