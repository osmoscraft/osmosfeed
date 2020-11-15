import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import * as htmlparse2 from "htmlparser2";
import yaml from "js-yaml";
import path from "path";

interface SourceDefinition {
  href: string;
}

interface ParsedItem {
  sourceHref: string;
  sourceTitle: string;
  title: string;
  description: string;
  link: string;
  daysOld: number;
  publishedOn: string;
}

async function run() {
  const sourcesText = fs.readFileSync(path.resolve("sources.yaml"), "utf8");

  const sources: SourceDefinition[] = yaml.safeLoad(sourcesText);

  const pagesAsync: Promise<ParsedItem[]>[] = sources.map(async (source) => {
    const response = await axios.get(source.href);
    const xmlString = response.data;
    const feed = htmlparse2.parseFeed(xmlString);

    const items = feed.items ?? [];
    const now = Date.now();

    const parsedItem: ParsedItem[] = items.map((item) => {
      const { title, link, pubDate, description } = item;

      const descriptionParsed = cheerio.load(description);
      const descriptionPlainText = safe_tags_replace(descriptionParsed.root().text()).trim().slice(0, 1024);

      return {
        sourceHref: source.href,
        sourceTitle: feed.title,
        title,
        description: descriptionPlainText,
        link,
        daysOld: Math.round((now - pubDate!.getTime()) / 1000 / 60 / 60 / 24),
        publishedOn: pubDate!.toISOString(),
      };
    });

    return parsedItem;
  });

  const posts = (await Promise.all(pagesAsync)).flat();
  const recentPosts = posts
    .filter((post) => post.daysOld < 14)
    .sort((b, a) => a.publishedOn.localeCompare(b.publishedOn));

  const postsBySourceByDates: Record<string, Record<string, ParsedItem[]>> = recentPosts.reduce(
    (groupedPosts, post) => {
      const publishedOnDate = post.publishedOn.split("T")[0];
      const sourceTitle = post.sourceTitle;
      groupedPosts[publishedOnDate] ??= [];
      groupedPosts[publishedOnDate][sourceTitle] ??= [];
      groupedPosts[publishedOnDate][sourceTitle].push(post);
      return groupedPosts;
    },
    Object.create(null)
  );

  const postsHtml = Object.entries(postsBySourceByDates)
    .map(
      ([date, postsBySource]) => `
    <section class="day-container">
    <h2>${date}</h2>
    ${Object.entries(postsBySource)
      .map(
        ([source, posts]) => `
        <h3>${source}</h3>
        <section class="articles-per-source">
          ${posts
            .map(
              (post) => `
          <article>
            <div class="title-assembly">
              <span class="actions">
                <button data-action="preview">+</button>
              </span>
              <a href="${post.link}">
              ${post.title}
              </a>
            </div>
            <p class="article-details">${post.description}</p>
          </article>`
            )
            .join("\n")}
        </section>
        `
      )
      .join("\n")}
    </section>
          `
    )
    .join("\n");

  const template = fs.readFileSync(path.resolve("src/index-template.html"), "utf8");
  const hydratedTemplate = template.replace("%CONTENT%", postsHtml);

  fs.mkdirSync(path.resolve("dist"), { recursive: true });
  fs.writeFileSync(path.resolve("dist/index.html"), hydratedTemplate);
}

run();

const tagsToReplace = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

function replaceTag(tag) {
  return tagsToReplace[tag] || tag;
}

function safe_tags_replace(str) {
  return str.replace(/[&<>]/g, replaceTag);
}
