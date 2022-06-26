//@ts-check
import {
  build,
  cache,
  configFileYaml,
  configInline,
  download,
  generate,
  merge,
  normalize,
  parse,
  prune,
} from "@osmosfeed/core";

const _configResult = configInline({
  feeds: [{ url: "https://news.ycombinator.com/rss" }],
});

build({
  preProjectTasks: [configFileYaml()],
  preFeedTasks: [download(), parse()],
  postFeedTasks: [normalize(), merge(), cache()],
  postProjectTasks: [generate(), prune()],
});
