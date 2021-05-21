#!/usr/bin/env node

import Handlebars from "handlebars";
import { performance } from "perf_hooks";
import { getSystemFiles } from "./lib-v2/get-system-files";
import { getCache, setCache } from "./lib/cache";
import { copyStatic } from "./lib/copy-static";
import { enrich, EnrichedSource } from "./lib/enrich";
import { getConfig } from "./lib/get-config";
import { getTemplateData } from "./lib/get-template-data";
import { getTemplates } from "./lib/get-templates";
import { userSnippets as getUserSnippets } from "./lib/get-user-snippets";
import { renderAtom } from "./lib/render-atom";
import { renderFiles } from "./lib/render-files";
import { renderUserSnippets } from "./lib/render-user-snippets";
import { cliVersion } from "./utils/version";

/*
 * Execution plan
 *
 * Read system files into memory
 * - Config file
 * - System templates
 * - Local cache file
 *
 * Read user files into memory
 * - User templates
 * - User snippets
 *
 * Parse config file content
 * - Get source list
 *
 * For each item in source list
 * - Get feed xml download url
 *
 * Download all feed xml files (parallelism)
 * Download remote cache into memory
 *
 * Parse new feed content
 * Merge new feed content with cache to get new cache
 *
 * Write cache to disk
 *
 * Render site from template
 * Render user snippets
 *
 * Render atom feed output
 */

async function run() {
  const startTime = performance.now();
  console.log(`[main] Starting build using cli version ${cliVersion}`);

  const pocSystemFiles = await getSystemFiles();

  const config = await getConfig();

  const templatesSummary = await getTemplates();
  const { userSnippets } = await getUserSnippets();

  const { sources, cacheUrl } = config;

  const cache = await getCache(cacheUrl);

  const enrichedSources: EnrichedSource[] = await Promise.all(
    sources.map((source) => enrich({ source, cache, config }))
  );

  setCache({ sources: enrichedSources, cliVersion });

  templatesSummary.handlebarPartials.forEach((partial) => Handlebars.registerPartial(partial.name, partial.template));

  const renderTemplate = Handlebars.compile("{{> index}}");

  const templateOutput = renderTemplate(getTemplateData({ enrichedSources, config }));
  const html = renderUserSnippets({ templateOutput, userSnippets, config });
  const atom = renderAtom({ enrichedSources, config });

  await renderFiles({ html, atom });
  await copyStatic(templatesSummary);

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
