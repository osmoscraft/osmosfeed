#!/usr/bin/env node

import Handlebars from "handlebars";
import { performance } from "perf_hooks";
import { getCache, setCache } from "./lib/cache";
import { copyStatic } from "./lib/copy-static";
import { enrich, EnrichedSource } from "./lib/enrich";
import { getConfig } from "./lib/get-config";
import { getTemplateData } from "./lib/get-template-data";
import { getTemplates } from "./lib/get-templates";
import { userSnippets as getUserSnippets } from "./lib/get-user-snippets";
import { renderAtom } from "./lib/render-atom";
import { renderFiles } from "./lib/render-files";
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

  const templatesSummary = await getTemplates();

  templatesSummary.partials.forEach((partial) => Handlebars.registerPartial(partial.name, partial.template));

  const entryTemplate = Handlebars.compile("{{> index}}");

  /** Hierarchy options:
   * - articles
   * - dates
   *   - articles
   *   - sources
   *     - articles
   * - sources
   *   - dates
   *     - articles
   *   - articles
   */
  const htmlOutput = entryTemplate(getTemplateData(enrichedSources));

  // TODO migrate system style sheet to index.css
  // TODO use template engine to handle site title and feed filename
  // POC use template engine to handle user snippet?
  // TODO prepare demos for all 5 custom structures

  const html = renderHtml({ templateOutput: htmlOutput, userSnippets, config });
  const atom = renderAtom({ enrichedSources, config });

  await renderFiles({ html, atom });

  await copyStatic();

  const durationInSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`[main] Finished build in ${durationInSeconds} seconds`);
}

run();
