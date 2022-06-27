#!/usr/bin/env tsx
import { build, cache, configFileYaml, download, generate, merge, normalize, parse, prune } from "@osmosfeed/core";

build({
  preProjectTasks: [configFileYaml()],
  preFeedTasks: [download(), parse()],
  postFeedTasks: [normalize(), merge(), cache()],
  postProjectTasks: [generate(), prune()],
});
