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
}).then((out) =>
  console.log(
    JSON.parse(JSON.stringify(out, (k, v) => (k === "content" ? v.slice(0, 100) + " | result truncated..." : v), 2))
  )
);
