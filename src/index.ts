import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import * as htmlparse2 from "htmlparser2";
import yaml from "js-yaml";
import path from "path";
import { render } from "./lib/render";
import { replaceHtmlTags } from "./utils/escape-html-tags";

interface SourceDefinition {
  href: string;
}

export interface ParsedItem {
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
      const descriptionPlainText = replaceHtmlTags(descriptionParsed.root().text()).trim().slice(0, 1024);

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

  const html = render({ posts: recentPosts });
  fs.mkdirSync(path.resolve("dist"), { recursive: true });
  fs.writeFileSync(path.resolve("dist/index.html"), html);
}

run();
