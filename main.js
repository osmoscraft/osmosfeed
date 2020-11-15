import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import htmlparse2 from "htmlparser2";
import axios from "axios";

async function run() {
  const sourcesText = fs.readFileSync(path.resolve("sources.yaml"), "utf8");

  /** @type {string[]} */
  const sources = yaml.safeLoad(sourcesText);

  const pagesAsync = sources.map(async (source) => {
    const response = await axios.get(source.href);
    const xmlString = response.data;
    const feed = htmlparse2.parseFeed(xmlString);

    const items = feed.items ?? [];

    return items.map((item) => {
      const { title, link, pubDate } = item;

      return {
        sourceHref: source.href,
        title,
        link,
        publishedOn: pubDate?.toISOString(),
      };
    });
  });

  const results = (await Promise.all(pagesAsync)).flat();
  console.log(results);

  const outputHtml = results
    .map(
      (result) =>
        `<article><a href="${result.link}">${result.title}<a></article>`
    )
    .join("\n");

  fs.writeFileSync(path.resolve("output.html"), outputHtml);
}

run();
