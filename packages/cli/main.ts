#!/usr/bin/env tsx
import {
  build,
  BuildConfig,
  configFileYaml,
  dev,
  download,
  generate,
  merge,
  normalize,
  parse,
  prune,
  readCache,
  writeCache,
} from "@osmosfeed/core";

console.log(`[cli] starting build`);

async function main() {
  const argv = process.argv;
  const isDevMode = argv.includes("--dev") || argv.includes("-d");
  console.log(`[cli] dev mode`, isDevMode);

  try {
    const partialBuild: BuildConfig = {
      preProjectTasks: [configFileYaml()],
      preFeedTasks: [readCache()],
      postFeedTasks: [merge()],
      postProjectTasks: [generate()],
    };

    const fullBuild: BuildConfig = {
      preProjectTasks: [configFileYaml()],
      preFeedTasks: [download(), parse(), readCache()],
      postFeedTasks: [normalize(), merge(), writeCache()],
      postProjectTasks: [generate(), prune()],
    };

    const devModeTasks = isDevMode
      ? [
          dev({
            onChange: (path) => {
              console.log("[cli] rebuilding on change");
              if (path.match(/osmosfeed.ya?ml$/)) {
                build(fullBuild);
              } else {
                build(partialBuild);
              }
            },
          }),
        ]
      : [];

    const dynamicBuild: BuildConfig = {
      ...fullBuild,
      postProjectTasks: [...(fullBuild.postProjectTasks ?? []), ...devModeTasks],
    };

    await build(dynamicBuild);

    console.log("[cli] build success");
    process.exit(0);
  } catch (e) {
    console.error("[cli] build failed", e);
    process.exit(1);
  }
}

main();
