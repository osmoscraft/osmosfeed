import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import htmlparse2 from "htmlparser2";
import axios from "axios";

async function run() {
  const sourcesText = fs.readFileSync(path.resolve("sources.yaml"), "utf8");

  const sources = yaml.safeLoad(sourcesText);

  const pagesAsync = sources.map(async (source) => {
    const response = await axios.get(source.href);
    const xmlString = response.data;
    const feed = htmlparse2.parseFeed(xmlString);
    return feed;
  });

  const results = await Promise.all(pagesAsync);

  results.map((result) => {
    console.log(result);
  });
}

run();
