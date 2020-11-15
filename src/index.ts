import fs from "fs";
import path from "path";
import { getCache, setCache } from "./lib/cache";
import { getSources } from "./lib/config";
import { enrich, EnrichedSource } from "./lib/enrich";
import { render } from "./lib/render";

async function run() {
  const sources = getSources();

  const cache = getCache();

  const articlesAsyncs: Promise<EnrichedSource>[] = sources.map(async (source) => {
    const enrichedSource = await enrich(source, cache);
    return enrichedSource;
  });

  const articles = (await Promise.all(articlesAsyncs)).map((enrichedSource) => enrichedSource.articles).flat();

  setCache({ articles });

  const html = render({ articles });
  fs.mkdirSync(path.resolve("dist"), { recursive: true });
  fs.writeFileSync(path.resolve("dist/index.html"), html);
}

run();
