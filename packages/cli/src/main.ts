#!/usr/bin/env node

import Handlebars from "handlebars";
import { performance } from "perf_hooks";
import { copyStatic } from "./lib-v2/copy-static";
import { discoverSystemFiles, discoverUserFiles } from "./lib-v2/discover-files";
import { getCache } from "./lib-v2/get-cache";
import { getConfig } from "./lib-v2/get-config";
import { getCopyStaticPlan } from "./lib-v2/get-copy-static-plan";
import { getSnippets } from "./lib-v2/get-snippets";
import { registerTemplates } from "./lib-v2/register-templates";
import { setCache } from "./lib-v2/set-cache";
import { writeFiles } from "./lib-v2/write-files";
import { enrich, EnrichedSource } from "./lib/enrich";
import { getTemplateData } from "./lib/get-template-data";
import { renderAtom } from "./lib/render-atom";
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

  const cache = await getCache({ cacheUrl: config.cacheUrl, localCacheFile: systemFiles.localCacheFile });

  const enrichedSources: EnrichedSource[] = await Promise.all(
    config.sources.map((source) => enrich({ source, cache, config }))
  );

  registerTemplates({ userTemplates: userFiles.userTemplateFiles, systemTemplates: systemFiles.systemTemplateFiles });
  const executableTemplate = Handlebars.compile("{{> index}}");
  const userSnippets = getSnippets(userFiles.userSnippetFiles);

  const templateOutput = executableTemplate(getTemplateData({ enrichedSources, config }));
  const html = renderUserSnippets({ templateOutput, userSnippets, config });
  const atom = renderAtom({ enrichedSources, config });
  await writeFiles({ html, atom });

  const copyPlan = getCopyStaticPlan({
    userStaticFiles: userFiles.userStaticFiles,
    userTemplateFiles: userFiles.userTemplateFiles,
    systemStaticFiles: systemFiles.systemStaticFiles,
    systemTemplateStaticFiles: systemFiles.systemTemplateStaticFiles,
  });

  await copyStatic(copyPlan);

  await setCache({ sources: enrichedSources, cliVersion });

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
