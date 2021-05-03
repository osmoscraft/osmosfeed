#!/usr/bin/env node

import fs from "fs";
import { performance } from "perf_hooks";
import path from "path";
import { copyAssets } from "./lib/assets";
import { getCache, setCache } from "./lib/cache";
import { getConfig } from "./lib/config";
import { enrich, EnrichedSource } from "./lib/enrich";
import { render } from "./lib/render";
import { cliVersion } from "./utils/version";

async function run() {
  const startTime = performance.now();
  console.log(`[main] Starting build using cli version ${cliVersion}`);

  const config = getConfig();
  const { sources, cacheUrl } = config;

  const cache = await getCache(cacheUrl);

  const enrichedSources: EnrichedSource[] = (await Promise.all(
    sources.map((source) => 
      enrich({ source, cache, config }).catch(err => console.error(err))
    )
  )).filter((result): result is EnrichedSource => result !== undefined);

  setCache({ sources: enrichedSources, cliVersion });

  const articles = enrichedSources
    .map((enrichedSource) => enrichedSource.articles)
    .flat()
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));

  const html = render({ articles });
  fs.mkdirSync(path.resolve("public"), { recursive: true });

  const indexPath = path.resolve("public/index.html");
  fs.writeFileSync(indexPath, html);

  await copyAssets();

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Index page updated ${indexPath}`);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
