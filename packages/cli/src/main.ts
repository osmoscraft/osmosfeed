#!/usr/bin/env node

import Handlebars from "handlebars";
import { performance } from "perf_hooks";
import { copyStatic } from "./lib/copy-static";
import { discoverSystemFiles, discoverUserFiles } from "./lib/discover-files";
import { getCache } from "./lib/get-cache";
import { getConfig } from "./lib/get-config";
import { getCopyStaticPlan } from "./lib/get-copy-static-plan";
import { getSnippets } from "./lib/get-snippets";
import { compileTemplates } from "./lib/compile-templates";
import { setCache } from "./lib/set-cache";
import { writeFiles } from "./lib/write-files";
import { enrich, EnrichedSource } from "./lib/enrich";
import { getTemplateData } from "./lib/get-template-data";
import { renderAtom } from "./lib/render-atom";
import { renderUserSnippets } from "./lib/render-user-snippets";
import { cliVersion } from "./utils/version";

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

  const executableTemplate = compileTemplates({
    userTemplates: userFiles.userTemplateFiles,
    systemTemplates: systemFiles.systemTemplateFiles,
  });
  const userSnippets = getSnippets(userFiles.userSnippetFiles);

  const baseHtml = executableTemplate(getTemplateData({ enrichedSources, config }));
  const userCustomizedHtml = renderUserSnippets({ baseHtml, userSnippets, config });
  const atom = renderAtom({ enrichedSources, config });
  await writeFiles({ html: userCustomizedHtml, atom });

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
