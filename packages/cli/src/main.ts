#!/usr/bin/env node

import Handlebars from "handlebars";
import { performance } from "perf_hooks";
import { discoverSystemFiles, discoverUserFiles } from "./lib-v2/discover-files";
import { getConfig } from "./lib-v2/get-config";
import { getSnippets } from "./lib-v2/get-snippets";
import { registerTemplates } from "./lib-v2/register-templates";
import { getCache, setCache } from "./lib/cache";
import { copyStatic } from "./lib/copy-static";
import { enrich, EnrichedSource } from "./lib/enrich";
import { getTemplateData } from "./lib/get-template-data";
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

  const systemFiles = await discoverSystemFiles();
  const config = await getConfig(systemFiles.configFile);
  const userFiles = await discoverUserFiles();

  registerTemplates({ userTemplates: userFiles.userTemplateFiles, systemTemplates: systemFiles.systemTemplateFiles });
  const userSnippets = getSnippets(userFiles.userSnippetFiles);

  // TODO consider parallelize with previous fs operations
  // TODO Fallback plan
  // With url, download remmote > With url, fallback to initial cache > Without url use local file > Throw error

  const cache = await getCache(config.cacheUrl);

  const enrichedSources: EnrichedSource[] = await Promise.all(
    config.sources.map((source) => enrich({ source, cache, config }))
  );

  setCache({ sources: enrichedSources, cliVersion });

  const renderTemplate = Handlebars.compile("{{> index}}");

  const templateOutput = renderTemplate(getTemplateData({ enrichedSources, config }));
  const html = renderUserSnippets({ templateOutput, userSnippets, config });
  const atom = renderAtom({ enrichedSources, config });

  await renderFiles({ html, atom });

  // TODO clean this up. split copy static into different tasks
  const isSystemTemplateIntact = userFiles.userTemplateFiles.length === 0;
  await copyStatic(isSystemTemplateIntact);

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
