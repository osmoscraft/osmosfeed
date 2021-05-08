#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import { performance } from "perf_hooks";
import { getCache, setCache } from "./lib/cache";
import { getConfig } from "./lib/get-config";
import { copyStatic } from "./lib/copy-static";
import { enrich, EnrichedSource } from "./lib/enrich";
import { userSnippets as getUserSnippets } from "./lib/get-user-snippets";
import { renderFiles } from "./lib/render-files";
import { renderAtom } from "./lib/render-atom";
import { renderHtml } from "./lib/render-html";
import { cliVersion } from "./utils/version";

async function run() {
  const startTime = performance.now();
  console.log(`[main] Starting build using cli version ${cliVersion}`);

  const config = getConfig();
  const { sources, cacheUrl } = config;

  const cache = await getCache(cacheUrl);

  const enrichedSources: EnrichedSource[] = await Promise.all(
    sources.map((source) => enrich({ source, cache, config }))
  );

  setCache({ sources: enrichedSources, cliVersion });

  const { userSnippets } = await getUserSnippets();

  const articles = enrichedSources
    .map((enrichedSource) => enrichedSource.articles)
    .flat()
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));

  const html = renderHtml({ articles, userSnippets, config });
  const atom = renderAtom({ articles, config });

  await renderFiles({ html, atom });

  await copyStatic();

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
