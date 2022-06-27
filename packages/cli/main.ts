#!/usr/bin/env tsx
import { build, cache, configFileYaml, download, generate, merge, normalize, parse, prune } from "@osmosfeed/core";

console.log(`[cli] starting build`);

build({
  preProjectTasks: [configFileYaml()],
  preFeedTasks: [download(), parse()],
  postFeedTasks: [normalize(), merge(), cache()],
  postProjectTasks: [generate(), prune()],
})
  .then(() => {
    console.log("[cli] build success");
    process.exit(0);
  })
  .catch((e) => {
    console.error("[cli] build failed", e);
    process.exit(1);
  });
